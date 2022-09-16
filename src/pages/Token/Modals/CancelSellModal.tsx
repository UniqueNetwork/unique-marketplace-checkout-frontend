import React, { FC, useEffect, useState } from 'react';
import { Heading, Loader, Text, useNotifications } from '@unique-nft/ui-kit';

// import { useCancelSellFixStages } from '../../../hooks/marketplaceStages';
// import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { useAccounts } from '../../../hooks/useAccounts';
// import { StageStatus } from '../../../types/StagesTypes';
import { delistTokenFiatSale } from '../../../api/restApi/checkout/checkout';
import styled from 'styled-components';

export const CancelSellFixStagesModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish, setIsClosable, testid }) => {
  const { selectedAccount } = useAccounts();
  // const { stages, status, initiate } = useCancelSellFixStages(offer?.collectionId || 0, offer?.tokenId || 0);
  const { info, error } = useNotifications();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!offer || !selectedAccount) return;
    (async () => {
      setLoading(true);
      await delistTokenFiatSale({ collectionId: offer.collectionId, tokenId: offer.tokenId });
    })()
    .then(() => {
      info(
        <div data-testid={`${testid}-success-notification`}>Sale canceled</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    })
    .catch(() => {
      error('Delist request failed');
    })
    .finally(() => {
      setLoading(false);
      onFinish();
    });
  }, [offer?.collectionId, offer?.tokenId, selectedAccount]);

  return (
    <div>
      <HeadingWrapper>
        <Heading size='2'>Please wait</Heading>
      </HeadingWrapper>
      <StageWrapper>
        <StatusWrapper>
          {loading && <Loader isFullPage />}
        </StatusWrapper>
        <TitleWrapper>
          <Text
            size={'m'}
            testid={`${testid}-stage`}
          >Delisting NFT</Text>
        </TitleWrapper>
      </StageWrapper>
    </div>
  );
};

const HeadingWrapper = styled.div`
  margin-bottom: 16px;
`;

const StageWrapper = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  grid-column-gap: var(--gap);
  grid-row-gap: var(--gap);
  align-items: flex-start;
`;

const StatusWrapper = styled.div`
  position: relative;
  height: 100%;
  > div {
    top: 12px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
