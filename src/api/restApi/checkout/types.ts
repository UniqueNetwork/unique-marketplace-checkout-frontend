import { SignerPayloadJSON } from '@polkadot/types/types';

export enum FetchStatus {
  default = 'Default',
  inProgress = 'InProgress',
  success = 'Success',
  error = 'Error'
}

export type TCheckoutPayParams = {
  tokenCard: string
  buyerAddress: string
  tokenId: string
  collectionId: string
}

export type TCheckoutFixedSellParams = {
  price: number
  currency: string
  signerPayloadJSON?: SignerPayloadJSON
  signature: `0x${string}`
}

export type TCheckoutDelistParams = {
  tokenId: number
  collectionId: number
  sellerAddress: string
  signature: `0x${string}`
}

export type TCheckoutPayResponse = {
  collectionId: number
  price: string
  quoteId: null
  seller: string
  status: string
  tokenId: number
  type: string
  statusCode?: number
  message?: string
}
