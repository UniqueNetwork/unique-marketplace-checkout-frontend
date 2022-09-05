import { Sdk } from '@unique-nft/substrate-client';
import { NFTToken } from './types';
import { Settings } from '../restApi/settings/types';
import { getEthAccount } from './utils/addressUtils';
import { checkTokenIsAllowed, filterAllowedTokens } from './utils/checkTokenIsAllowed';

export class UniqueSDKNFTController {
  private sdk: Sdk;
  private readonly collectionIds: number[];
  private readonly allowedTokens: Record<number, string>;
  constructor(sdk: Sdk, settings: Settings) {
    this.sdk = sdk;
    this.collectionIds = settings.blockchain.unique.collectionIds;
    this.allowedTokens = settings.blockchain?.unique?.allowedTokens.reduce((acc, item) => ({ ...acc, [item.collection]: item.tokens }), {}) || {};
  }

  async getAccountMarketableTokens(address: string): Promise<NFTToken[]> {
    if (!this.sdk?.api || !address) {
      return [];
    }
    const tokens: NFTToken[] = [];

    for (const collectionId of this.collectionIds) {
      try {
        const tokensIds =
          (await this.sdk?.tokens.getAccountTokens({ collectionId, address }))?.tokens || [];
        const tokensIdsOnEth =
          (await this.sdk?.tokens.getAccountTokens({ collectionId, address: getEthAccount(address) }))?.tokens || [];

        const currentAllowedTokens = this.allowedTokens[collectionId];
        const allowedIds = filterAllowedTokens([...tokensIds, ...tokensIdsOnEth], currentAllowedTokens);
        const tokensOfCollection = (await Promise.all(allowedIds
          .map(({ tokenId }) =>
            this.getToken(collectionId, tokenId)))) as NFTToken[];

        tokens.push(...tokensOfCollection);
      } catch (e) {
        console.log(`Wrong ID of collection ${collectionId}`, e);
      }
    }
    return tokens;
  }

  async getToken(collectionId: number, tokenId: number): Promise<NFTToken | null> {
    const token = await this.sdk.tokens.get_new({ collectionId, tokenId });
    const collection = await this.sdk.collections.get_new({ collectionId });
    if (!token || !collection) return null;

    const { owner, attributes, image, video } = token;
    const { name, tokenPrefix, description, schema } = collection;

    const imageUrl = image?.fullUrl || '';
    const collectionCover = schema?.coverPicture?.fullUrl || '';

    const isAllowed = this.allowedTokens[collectionId] ? checkTokenIsAllowed(tokenId, this.allowedTokens[collectionId].split(',')) : true;

    return {
      id: tokenId,
      owner,
      attributes,
      imageUrl,
      collectionId,
      collectionName: name,
      prefix: tokenPrefix,
      description,
      collectionCover,
      isAllowed,
      video
    };
  }
}
