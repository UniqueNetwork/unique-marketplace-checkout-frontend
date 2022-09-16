import { useMemo } from 'react';

import { cancelAuction } from 'api/restApi/auction/auction';
import { useAccounts } from '../useAccounts';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { delistTokenFiatSale } from '../../api/restApi/checkout/checkout';

export const useCancelFiatStages = (collectionId: number, tokenId: number) => {
  const { selectedAccount, signMessage, signPayloadJSON } = useAccounts();
  const cancelAuctionStages: InternalStage<null>[] = useMemo(() => [
    {
      title: 'Cancelling sale',
      description: '',
      status: StageStatus.default,
      action: async () => {
        if (!selectedAccount) throw new Error('Account not selected');

        const message = `collectionId=${collectionId}&tokenId=${tokenId}`;
        const signature = await signMessage(message);
        await delistTokenFiatSale(
          { collectionId, tokenId },
          { signature, signer: selectedAccount.address }
        );
      }
    }
  ], [collectionId, tokenId, signMessage]);
  const { stages, error, status, initiate } = useStages<null>(cancelAuctionStages, signPayloadJSON);

  return {
    stages,
    error,
    status,
    initiate
  };
};
