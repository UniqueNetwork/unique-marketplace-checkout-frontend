import { Settings } from 'api/restApi/settings/types';
import { TokenIdArguments } from '@unique-nft/substrate-client/tokens';

export const checkAllowedTokenInSettings = (tokenId: number, collectionId: number, settings?: Settings) => {
  const allowedTokens = settings?.blockchain.unique.allowedTokens.find((item) => item.collection === collectionId)?.tokens.split(',') || [];
  return checkTokenIsAllowed(tokenId, allowedTokens);
};

export const checkTokenIsAllowed = (tokenId: number, allowedTokens: string[]) => {
  if (allowedTokens.length === 0) return true;
  const checkInRange = ([start, end]: string[]) => Number(start) <= tokenId && Number(end) >= tokenId;
  return allowedTokens.some((item) => /^\d+-\d+$/.test(item) ? checkInRange(item.split('-')) : Number(item) === tokenId);
};

export const filterAllowedTokens = (tokens: TokenIdArguments[], allowedTokens?: string) => {
  if (!allowedTokens) return tokens;
  return tokens.filter(({ tokenId }) => checkTokenIsAllowed(tokenId, allowedTokens.split(',')));
};
