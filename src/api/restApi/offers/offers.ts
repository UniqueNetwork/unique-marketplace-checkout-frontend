import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

import { get } from '../base';
import { defaultParams } from '../base/axios';
import { Attribute, AttributeCount, GetOffersRequestPayload, Offer, OffersResponse } from './types';
import { ResponseError } from '../base/types';
import { fromStringToBnString } from 'utils/bigNum';

const endpoint = '/api/Offers';

export const fiatDecimals = 2;

export const getOffers = (payload: GetOffersRequestPayload) => get<OffersResponse>(endpoint, { ...defaultParams, params: payload });

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersCount, setOffersCount] = useState<number>(0);
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback(async ({ minPrice, maxPrice, ...payload }: GetOffersRequestPayload) => {
    setIsFetching(true);
    try {
      const { status, data } = await getOffers({
        ...payload,
        minPrice: minPrice && fromStringToBnString(minPrice, fiatDecimals),
        maxPrice: maxPrice && fromStringToBnString(maxPrice, fiatDecimals)
      });
      if (status === 200) {
        setOffers(data.items);
        setOffersCount(data.itemsCount);
        setAttributes(data.attributes);
        setAttributeCounts(data.attributesCount);
        setIsFetching(false);
        return data;
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
    }
    return { items: [], attributes: {}, attributesCount: [], itemsCount: 0, page: 1, pageSize: 10 };
  }, []);

  const fetchMore = useCallback(async ({ minPrice, maxPrice, ...payload }: GetOffersRequestPayload) => {
    setIsFetching(true);
    try {
      const { status, data } = await getOffers({
        ...payload,
        minPrice: minPrice && fromStringToBnString(minPrice, fiatDecimals),
        maxPrice: maxPrice && fromStringToBnString(maxPrice, fiatDecimals)
      });
      if (status === 200) {
        setOffers([...offers, ...data.items]);
        setIsFetching(false);
      }
    } catch (err) {
      const { response, message } = err as AxiosError;
      setFetchingError({
        status: response?.status,
        message
      });
    }
  }, [offers]);

  return {
    offers,
    offersCount,
    isFetching,
    fetchingError,
    fetch,
    fetchMore,
    attributes,
    attributeCounts
  };
};
