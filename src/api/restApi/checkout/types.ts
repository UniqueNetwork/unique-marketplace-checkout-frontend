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

export type TCheckoutPayResponse = {
  isOk: boolean
}
