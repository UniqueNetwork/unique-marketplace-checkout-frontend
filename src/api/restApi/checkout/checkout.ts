import { post } from '../base';
import { defaultParams } from '../base/axios';
import { TCheckoutPayParams, FetchStatus, TCheckoutFixedSellParams } from './types';
import { useCallback, useState } from 'react';

const endpoint = '/api';

export const payForTokenWithCardMethod = (body: TCheckoutPayParams) => post<TCheckoutPayParams>(`${endpoint}/pay`, body, { ...defaultParams });
export const sellTokenForFixedFiat = (body: TCheckoutFixedSellParams) => post<TCheckoutFixedSellParams>(`${endpoint}/create_fiat_offer`, body, { ...defaultParams });

export const useCheckout = () => {
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<FetchStatus>(FetchStatus.default);
  const payForTokenWithCard = useCallback(
    async (params: TCheckoutPayParams) => {
      try {
        setPaymentRequestStatus(FetchStatus.inProgress);
        await payForTokenWithCardMethod(params);
        setPaymentRequestStatus(FetchStatus.success);
      } catch (e) {
        setPaymentRequestStatus(FetchStatus.error);
        console.error('Failed to pay with card', e);
      }
    },
    []
  );

  return { payForTokenWithCard, paymentRequestStatus };
};
