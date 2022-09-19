import { post, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { TCheckoutPayParams, FetchStatus, TCheckoutFixedSellParams, TCheckoutDelistParams } from './types';
import { useCallback, useState } from 'react';
import { JWTokenLocalStorageKey } from '../admin/login';
import { TSignature } from '../auction/types';

const endpoint = '/api';

export const payForTokenWithCardMethod = (body: TCheckoutPayParams) => post<TCheckoutPayParams>(`${endpoint}/pay`, body, { ...defaultParams });
export const sellTokenForFixedFiat = (body: TCheckoutFixedSellParams) => post<TCheckoutFixedSellParams>(`${endpoint}/create_fiat_offer`, body, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const delistTokenFiatSale = (body: TCheckoutDelistParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/cancel_fiat_offer`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${signature}` }, ...defaultParams, params: body });

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
