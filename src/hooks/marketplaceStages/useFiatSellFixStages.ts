import { useMemo } from 'react';
import { useApi } from '../useApi';
import { TFiatFixPriceProps } from '../../pages/Token/Modals/types';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';
import { sellTokenForFixedFiat } from '../../api/restApi/checkout/checkout';

export const useFiatSellFixStages = (collectionId: number, tokenId: number) => {
  const { api } = useApi();
  const { signPayloadJSON, signMessage } = useAccounts();
  const marketApi = api?.market;

  const sellFiatFixStages: InternalStage<TFiatFixPriceProps>[] = useMemo(() => [
    {
      title: 'Set the NFT price',
      description: '',
      status: StageStatus.default,
      action: (params) =>
        marketApi?.transferTokenToFiatFixPrice(
          params.txParams.accountAddress,
          collectionId.toString(),
          tokenId.toString(),
          {
            ...params.options,
            signMessage,
            send:
              ({ signature, signerPayloadJSON }) => {
                return sellTokenForFixedFiat({ signerPayloadJSON, signature, price: Number(params.txParams.price), currency: 'USD' });
              }
          }
        )
    }
  ], [marketApi, api?.market?.kusamaDecimals, collectionId, tokenId]);

  const { stages, error, status, initiate } = useStages<TFiatFixPriceProps>(sellFiatFixStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
