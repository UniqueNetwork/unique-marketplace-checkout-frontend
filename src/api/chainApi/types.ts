import { ChainData } from '../ApiContext';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Settings } from '../restApi/settings/types';

export interface IRpc {
  rpcEndpoint: string
  isApiConnected: boolean
  isApiInitialized: boolean
  apiConnectionError?: string
  rawRpcApi?: ApiPromise // allow access to the raw API for exceptions in the future
  setOnChainReadyListener(callback: (chainData: ChainData) => void): void
  changeEndpoint(endpoint: string, options?: IRpcClientOptions): void
}

export interface IRpcClient extends IRpc {
  initialize(config: IRpcConfig, options?: IRpcClientOptions): Promise<void>
  nftController?: INFTController<any, any>
  collectionController?: ICollectionController<any, any>
  marketController?: IMarketController
  chainData: any
}

export type IRpcConfig = Settings;

export interface IRpcClientOptions {
  onChainReady?: (chainData: ChainData) => void

}

export interface INFTController<Collection, Token> {
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
  getAccountTokens(account: string): Promise<Token[]>
}

export interface ICollectionController<Collection, Token> {
  getCollection(collectionId: number): Promise<Collection | null>
  getCollections(): Promise<Collection[]>
  getFeaturedCollections(): Promise<Collection[]>
  getTokensOfCollection(collectionId: number, ownerId: string): Promise<Token[]>
}

export interface IAccountController<Collection, Token> {
  getAccounts: any
}

export type TTransaction = SubmittableExtrinsic<'promise'>

export type TransactionOptions = {
  sign: (tx: TTransaction) => Promise<TTransaction>
};

export interface IMarketController {
  // substrate address
  addToWhiteList: (account: string, options: TransactionOptions) => Promise<void>
  checkWhiteListed: (account: string) => Promise<boolean>
  lockNftForSale: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  sendNftToSmartContract: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  setForFixPriceSale: (account: string, collectionId: string, tokenId: string, price: number, options: TransactionOptions) => Promise<void>
  cancelSell: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  unlockNft: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  addDeposit: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  buyToken: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  transferToken: (from: string, to: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
}

export type Chain = {
  network: string
  name: string
  apiEndpoint: string
}
