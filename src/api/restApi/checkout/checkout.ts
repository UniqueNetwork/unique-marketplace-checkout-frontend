import { post, deleteRequest } from '../base';
import { defaultParams } from '../base/axios';
import { TCheckoutPayParams, FetchStatus, TCheckoutFixedSellParams, TCheckoutDelistParams } from './types';
import { useCallback, useState } from 'react';
import { JWTokenLocalStorageKey } from '../admin/login';
import { TSignature } from '../auction/types';
import { useNotifications } from 'components/UI';

const endpoint = '/api';

const validateStatus = (status: number) => status === 200 || status === 201 || status === 400;

export const payForTokenWithCardMethod = (body: TCheckoutPayParams) => post<TCheckoutPayParams>(`${endpoint}/pay`, body, { ...defaultParams, validateStatus });
export const sellTokenForFixedFiat = (body: TCheckoutFixedSellParams) => post<TCheckoutFixedSellParams>(`${endpoint}/create_fiat_offer`, body, { headers: { ...defaultParams.headers, Authorization: `Bearer ${localStorage.getItem(JWTokenLocalStorageKey)}` }, ...defaultParams });
export const delistTokenFiatSale = (body: TCheckoutDelistParams, { signer, signature }: TSignature) => deleteRequest(`${endpoint}/cancel_fiat_offer`, { headers: { ...defaultParams.headers, Authorization: `Bearer ${signature}` }, ...defaultParams, params: body });

export const useCheckout = () => {
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<FetchStatus>(FetchStatus.default);
  const { error } = useNotifications();

  const payForTokenWithCard = useCallback(
    async (params: TCheckoutPayParams) => {
      try {
        setPaymentRequestStatus(FetchStatus.inProgress);
        const response = await payForTokenWithCardMethod(params);
        if (response.status === 400) {
          error(`Sorry, your purchase couldn't be completed (${response.data.statusCode}: ${response.data.message})`);
          setPaymentRequestStatus(FetchStatus.error);
          return;
        }
        setPaymentRequestStatus(FetchStatus.success);
      } catch (e) {
        setPaymentRequestStatus(FetchStatus.error);
        console.log(e);
        console.error('Failed to pay with card', e);
        error('Sorry, your purchase couldn\'t be completed');
        return;
      }
      setPaymentRequestStatus(FetchStatus.success);
    },
    []
  );

  return { payForTokenWithCard, paymentRequestStatus };
};
