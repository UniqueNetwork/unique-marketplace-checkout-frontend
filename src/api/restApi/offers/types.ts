import { PaginatedResponse, Pagination, Sortable } from '../base/types';
import { VideoAttribute } from '../../uniqueSdk/types';
import { DecodedAttributes, DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';

export type GetOffersRequestPayload = {
  collectionId?: number | number[]
  minPrice?: string
  maxPrice?: string
  seller?: string
  isAuction?: boolean
  bidderAddress?: string
  attributes?: string[]
  numberOfAttributes?: number[]
  searchText?: string
  searchLocale?: string
} & Pagination & Sortable;

export type Bid = {
  amount: string
  balance: string
  bidderAddress: string
  createdAt: string
  pendingAmount: string
  updatedAt: string
}

export type Auction = {
  bids: Bid[]
  priceStep: string
  startPrice: string
  status: 'created' | 'active' | 'withdrawing' | 'stopped' // ???
  stopAt: string
}

export type OfferTokenAttribute = {
  key: string
  type: string
  value: string | string[]
}

export type Offer = {
  collectionId: number
  tokenId: number
  price: string
  quoteId: number
  seller: string
  creationDate: string
  auction: Auction | null
  tokenDescription: {
    collectionName: string
    collectionCover: string | null
    description: string
    image?: DecodedInfixOrUrlOrCidAndHash | string
    prefix: string
    attributes: OfferTokenAttribute[]
    video?: string | VideoAttribute
  }
  currency: string
  type: string
}

export type OffersResponse = PaginatedResponse<Offer> & {
  attributes: Record<string, Attribute[]>;
  attributesCount: AttributeCount[]
}

export type UseFetchOffersProps = Partial<GetOffersRequestPayload>

export type Attribute = {
  key: string;
  count: number;
};

export type AttributesResponse = {
  collectionId: number;
  attributes: Record<string, Attribute[]>;
};

export type AttributeCount = {
  numberOfAttributes: number
  amount: number
};
