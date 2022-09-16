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
}

export type TCheckoutPayResponse = {
  isOk: boolean
}
