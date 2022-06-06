import { post } from '../base';
import { defaultParams } from '../base/axios';
import { TCheckoutPayParams } from './types';
import { useCallback } from 'react';

const endpoint = '/api/payment/checkout';

export const payForTokenWithCardMethod = (body: TCheckoutPayParams) => post<TCheckoutPayParams>(`${endpoint}/pay`, body, { ...defaultParams });

export const useCheckout = () => {
  const payForTokenWithCard = useCallback(
    async (params: TCheckoutPayParams) => {
      try {
        await payForTokenWithCardMethod(params);
      } catch (e) {
        console.error('Failed to pay with card', e);
      }
    },
    []
  );

  return { payForTokenWithCard };
};
