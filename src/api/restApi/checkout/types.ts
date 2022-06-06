export type TCheckoutPayParams = {
  tokenCard: string
  transferAddress: string
  tokenId: number
  collectionId: number
}

export type TCheckoutPayResponse = {
  isOk: boolean
}
