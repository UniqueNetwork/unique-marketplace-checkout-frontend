import { Sdk } from '@unique-nft/substrate-client';
import { TokenIdArguments, TokenByIdResult } from '@unique-nft/substrate-client/tokens';
import { isEthereumAddress } from '@unique-nft/substrate-client/utils';
import { BN } from '@polkadot/util';
import { EvmCollectionAbiMethods, MarketplaceAbiMethods, TokenAskType, TransactionOptions, TSignMessage } from './types';
import marketplaceAbi from './abi/marketPlaceAbi.json';
import nonFungibleAbi from './abi/nonFungibleAbi.json';
import { collectionIdToAddress, getEthAccount, compareEncodedAddresses, isTokenOwner } from './utils/addressUtils';
import { formatKsm, fromStringToBnString } from './utils/textFormat';
import { repeatCheckForTransactionFinish } from './utils/repeatCheckTransaction';
import { Settings } from '../restApi/settings/types';
import '@unique-nft/substrate-client/balance';
import { Address, AllBalances } from '@unique-nft/substrate-client/types';
import Web3 from 'web3';

export class UniqueSDKMarketController {
  private uniqueSdk: Sdk;
  private kusamaSdk: Sdk;
  private settings;
  private web3Instance: Web3;
  private minPrice = 0.000001;
  private defaultGasAmount = 2500000;
  private contractAddress: string;
  private escrowAddress: string;
  private auctionAddress: string;
  kusamaDecimals: number;

  constructor(uniqueSdk: Sdk, kusamaSdk: Sdk, settings: Settings) {
    this.uniqueSdk = uniqueSdk;
    this.kusamaSdk = kusamaSdk;
    this.settings = settings;
    this.kusamaDecimals = this.kusamaSdk.chainProperties().decimals;
    this.escrowAddress = settings.blockchain.escrowAddress;
    this.contractAddress = settings.blockchain.unique.contractAddress;
    this.auctionAddress = settings.auction.address;

    const provider = new Web3.providers.WebsocketProvider(this.settings.blockchain.unique.wsEndpoint, {
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false
      }
    });

    const web3 = new Web3(provider);
    this.web3Instance = web3;
  }

  private getMatcherContractInstance(ethAddress: string): { methods: MarketplaceAbiMethods } {
    // @ts-ignore
    return new this.web3Instance.eth.Contract(marketplaceAbi.abi, this.contractAddress, {
      from: ethAddress
    });
  }

  private getEvmCollectionInstance(collectionId: string): { methods: EvmCollectionAbiMethods, options: any } {
    // @ts-ignore
    return new this.web3Instance.eth.Contract(nonFungibleAbi, collectionIdToAddress(parseInt(collectionId, 10)), { from: this.contractOwner });
  }

  // purchase
  async addDeposit(address: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const matcherContractInstance = this.getMatcherContractInstance(getEthAccount(address));
    const userDeposit = await this.getUserDeposit(address);
    if (!userDeposit) throw new Error('No user deposit');

    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token = await this.uniqueSdk.tokens.get_new(tokenIdArguments);
    if (!token) throw new Error('Token not found');

    const ask = await matcherContractInstance.methods.getOrder(collectionIdToAddress(Number(collectionId)), tokenId).call();
    if (!ask?.price) throw new Error('Token has no price');

    const price = new BN(ask.price);
    if (price.lte(userDeposit)) {
      // Deposit already exists
      return;
    }

    // Get required amount to deposit
    const needed = price.sub(userDeposit);
    const { availableBalance } = await this.kusamaSdk.balance.get({ address });

    if ((new BN(availableBalance.raw)).lt(needed)) {
      throw new Error(`Your KSM balance is too low: ${availableBalance.formatted} KSM. You need at least: ${formatKsm(needed, this.kusamaDecimals, this.minPrice)} KSM`);
    }
    await this.transferBalance(address, this.escrowAddress, formatKsm(needed, this.kusamaDecimals, 0), options);

    await repeatCheckForTransactionFinish(async () => {
        return price.lte(await this.getUserDeposit(address));
      }
    );
  }

  // purchase
  async addToWhiteList(address: Address, options: TransactionOptions, signMessage: TSignMessage): Promise<void> {
    const ethAddress = getEthAccount(address);
    const isWhiteListed = await this.checkWhiteListed(ethAddress);
    if (isWhiteListed) {
      return;
    }

    try {
      const signaturePhrase = 'allowedlist';
      const signature = await signMessage(signaturePhrase);
      if (options.send) await options.send({ signature });
    } catch (e) {
      console.error('Signing failed', e);
      return;
    }

    try {
      await repeatCheckForTransactionFinish(async () => await this.checkWhiteListed(address));
      return;
    } catch (e) {
      console.error('addToWhiteList error pushed upper');
      throw e;
    }
  }

  // purchase
  async buyToken(address: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const ethAddress = getEthAccount(address);
    const evmCollectionInstance = this.getEvmCollectionInstance(collectionId);
    const matcherContractInstance = this.getMatcherContractInstance(ethAddress);
    const abi = matcherContractInstance.methods.buyKSM(evmCollectionInstance.options.address, tokenId, ethAddress, ethAddress).encodeABI();

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      address,
      section: 'evm',
      method: 'call',
      args: [
        ethAddress,
        this.contractAddress,
        abi,
        0,
        this.defaultGasAmount,
        await this.web3Instance.eth.getGasPrice(),
        null,
        null,
        []
      ]
    });
    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  // sell
  async cancelSell(address: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const ethAddress = getEthAccount(address);
    const matcherContractInstance = this.getMatcherContractInstance(ethAddress);
    const evmCollectionInstance = this.getEvmCollectionInstance(collectionId);

    const { flagActive }: TokenAskType = await matcherContractInstance.methods.getOrder(collectionIdToAddress(parseInt(collectionId, 10)), tokenId).call();

    if (flagActive === '0') return;

    const abi = matcherContractInstance.methods.cancelAsk(
      evmCollectionInstance.options.address,
      tokenId
    ).encodeABI();

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      address,
      section: 'evm',
      method: 'call',
      args: [
        getEthAccount(address),
        this.contractAddress,
        abi,
        0,
        this.defaultGasAmount,
        await this.web3Instance.eth.getGasPrice(),
        null,
        null,
        []
      ]
    });
    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  // account
  async checkWhiteListed(address: Address): Promise<boolean> {
    const ethAddress = getEthAccount(address);
    try {
      return (await this.uniqueSdk.api.query.evmContractHelpers.allowlist(this.contractAddress, ethAddress)).toJSON() as boolean;
    } catch (e) {
      console.error('Check for whitelist failed', e);
      throw e;
    }

    return Promise.resolve(false);
  }

  // fee
  async getKusamaFee(sender: Address, recipient?: string, value?: BN): Promise<string | null> {
    const transferFee = await this.kusamaSdk.extrinsics.getFee({
      address: sender,
      section: 'balances',
      method: 'transfer',
      args: [
        recipient || '',
        value || 0
      ]
    });
    return transferFee.amount;
  }

  // account
  async getUserDeposit(address: Address): Promise<BN> {
    const ethAddress = getEthAccount(address);

    const matcherContractInstance = this.getMatcherContractInstance(ethAddress);
    const result = await matcherContractInstance.methods.balanceKSM(ethAddress).call();

    if (result) {
      const deposit = new BN(result);
      return deposit;
    }
    throw new Error('Failed to get user deposit');
  }

  // sell
  async lockNftForSale(address: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const ethAddress = getEthAccount(address);

    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token = await this.uniqueSdk.tokens.get_new(tokenIdArguments);
    if (!token) throw new Error('Token not found');
    if (isTokenOwner(address, token.owner)) return;

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      section: 'unique',
      method: 'transfer',
      args: [{ ethereum: ethAddress }, tokenIdArguments.collectionId, tokenIdArguments.tokenId, 1],
      address: options.signer || '',
      isImmortal: false
    });

    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  // sell
  private async checkIfNftApproved (tokenOwner: Address, collectionId: string, tokenId: string): Promise<boolean> {
    // @ts-ignore
    const { unique } = this.uniqueSdk?.api.rpc || {};
    const approvedCount = (await unique?.allowance(Number(collectionId), { Substrate: tokenOwner }, { Ethereum: this.contractAddress }, Number(tokenId)))?.toJSON();

    return approvedCount === 1;
  }

  // sell
  async sendNftToSmartContract(address: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token = await this.uniqueSdk.tokens.get_new(tokenIdArguments);
    if (!token) throw new Error('Token not found');

    const evmCollectionInstance = this.getEvmCollectionInstance(collectionId);
    const approved = await this.checkIfNftApproved(token.owner, collectionId, tokenId);

    if (approved) return;

    const abi = evmCollectionInstance.methods.approve(this.contractAddress, tokenId).encodeABI();

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      address,
      section: 'evm',
      method: 'call',
      args: [
        getEthAccount(address),
        evmCollectionInstance.options.address,
        abi,
        0,
        this.defaultGasAmount,
        await this.web3Instance.eth.getGasPrice(),
        null,
        null,
        []
      ]
    });

    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  // sell
  async setForFixPriceSale(address: Address, collectionId: string, tokenId: string, price: string, options: TransactionOptions): Promise<void> {
    const ethAddress = getEthAccount(address);
    const evmCollectionInstance = this.getEvmCollectionInstance(collectionId);
    const matcherContractInstance = this.getMatcherContractInstance(ethAddress);

    const abi = matcherContractInstance.methods.addAsk(
      fromStringToBnString(price, this.kusamaDecimals),
      '0x0000000000000000000000000000000000000001',
      evmCollectionInstance.options.address,
      tokenId
    ).encodeABI();

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      address,
      section: 'evm',
      method: 'call',
      args: [
        ethAddress,
        this.contractAddress,
        abi,
        0,
        this.defaultGasAmount,
        await this.web3Instance.eth.getGasPrice(),
        null,
        null,
        []
      ]
    });
    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  // account
  async transferBalance(address: Address, destination: string, amount: string, options: TransactionOptions): Promise<void> {
    const unsignedTxPayload = await this.kusamaSdk.extrinsics.build({
      section: 'balances',
      method: 'transfer',
      args: [destination, Number(amount) * Math.pow(10, this.kusamaDecimals)],
      address,
      isImmortal: false
    });

    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');
    if (options.send) {
      const { signerPayloadJSON } = unsignedTxPayload;

      await options.send({ signerPayloadJSON, signature });
    } else {
      await this.kusamaSdk.extrinsics.submitWaitCompleted({
        signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
        signature
      });
    }
  }

  async transferBidBalance(address: Address, amount: string, options: TransactionOptions): Promise<void> {
    const unsignedTxPayload = await this.kusamaSdk.extrinsics.build({
      section: 'balances',
      method: 'transferKeepAlive',
      args: [this.auctionAddress, Number(amount) * Math.pow(10, this.kusamaDecimals)],
      address,
      isImmortal: false
    });

    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');
    if (options.send) {
      const { signerPayloadJSON } = unsignedTxPayload;

      await options.send({ signerPayloadJSON, signature });
    } else {
      await this.kusamaSdk.extrinsics.submitWaitCompleted({
        signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
        signature
      });
    }
  }

  transferToAuction(owner: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    return this.transferToken(owner, this.auctionAddress, collectionId, tokenId, options);
  }

  // token
  async transferToken(from: Address, to: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token = await this.uniqueSdk.tokens.get_new(tokenIdArguments);
    if (!token) throw new Error('Token not found');

    if (!isTokenOwner(from, token.owner)) throw new Error('You are not owner of this token');

    const unsignedTxPayload = await this.uniqueSdk.tokens.transfer.build({
      address: from,
      from,
      to,
      ...tokenIdArguments
    });

    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    if (options.send) {
      const { signerPayloadJSON } = unsignedTxPayload;

      await options.send({ signerPayloadJSON, signature });
    } else {
      await this.uniqueSdk.extrinsics.submitWaitCompleted({
        signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
        signature
      });
    }
  }

  // purchase
  async unlockNft(address: Address, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const ethAddress = getEthAccount(address);

    const tokenIdArguments: TokenIdArguments = {
      collectionId: Number(collectionId), tokenId: Number(tokenId)
    };

    const token: TokenByIdResult | null = await this.uniqueSdk.tokens.get_new(tokenIdArguments);
    if (!token) throw new Error('Token for unlock not found');
    const owner = token.owner;

    if (owner && !isEthereumAddress(owner) && compareEncodedAddresses(owner, address)) return;

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      section: 'unique',
      method: 'transferFrom',
      args: [{ ethereum: ethAddress }, { substrate: address }, tokenIdArguments.collectionId, tokenIdArguments.tokenId, 1],
      address: address,
      isImmortal: false
    });
    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  // account
  async withdrawDeposit(address: Address, options: TransactionOptions): Promise<void> {
    if (!address || address === '') throw new Error('Address not provided');
    const ethAddress = getEthAccount(address);
    const matcherContractInstance = this.getMatcherContractInstance(ethAddress);
    const userDeposit = await this.getUserDeposit(address);

    if (!userDeposit || userDeposit.isZero()) throw new Error('No user deposit');

    const abi = matcherContractInstance.methods.withdrawAllKSM(ethAddress).encodeABI();

    const unsignedTxPayload = await this.uniqueSdk.extrinsics.build({
      address,
      section: 'evm',
      method: 'call',
      args: [
        ethAddress,
        this.contractAddress,
        abi,
        0,
        this.defaultGasAmount,
        await this.web3Instance.eth.getGasPrice(),
        null,
        null,
        []
      ]
    });
    const signature = await options.sign?.(unsignedTxPayload);

    if (!signature) throw new Error('Signing failed');

    await this.uniqueSdk.extrinsics.submitWaitCompleted({
      signerPayloadJSON: unsignedTxPayload.signerPayloadJSON,
      signature
    });
  }

  async getAccountBalance(address: Address): Promise<AllBalances> {
    return await this.kusamaSdk.balance.get({ address });
  }
}
