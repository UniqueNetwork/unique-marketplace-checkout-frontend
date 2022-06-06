import { Dispatch, SetStateAction } from 'react';

export type Statuses = Record<'myNFTs' | 'fixedPrice' | 'timedAuction' | 'myBets', boolean | undefined>

export type PriceRange = {
  minPrice?: string
  maxPrice?: string
};

export type AttributeItem = { key: string, attribute: string };

export type FilterState = {
  statuses?: Statuses | undefined
  prices?: PriceRange | undefined
  collections?: number[]
  attributes?: AttributeItem[]
  attributeCounts?: number[]
};

export type FilterChangeHandler<T> = Dispatch<SetStateAction<T | null>> | ((value: T | null) => void);

export type FiltersProps<T = FilterState> = {
  value: T | null
  onFilterChange: FilterChangeHandler<T>
}
