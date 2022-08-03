import React, { FC, useCallback } from 'react';
import { Checkbox } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Statuses } from './types';
import Accordion from '../Accordion/Accordion';
import { useAccounts } from '../../hooks/useAccounts';

interface StatusFilterProps {
  value: Statuses | undefined
  onChange(value: Statuses): void
  testid: string
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, testid }) => {
  const { myNFTs, myBets, fixedPrice, timedAuction } = value || {};
  const { selectedAccount } = useAccounts();

  const onMyNFTsChange = useCallback((value: boolean) => {
    onChange({ myNFTs: value, fixedPrice, timedAuction, myBets });
  }, [fixedPrice, timedAuction, myBets, onChange]);

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice: value, timedAuction, myBets });
  }, [myNFTs, timedAuction, myBets, onChange]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction: value, myBets });
  }, [myNFTs, fixedPrice, myBets, onChange]);

  const onMyBetsChange = useCallback((value: boolean) => {
    onChange({ myNFTs, fixedPrice, timedAuction, myBets: value });
  }, [myNFTs, fixedPrice, timedAuction, onChange]);

  const onClear = useCallback(() => {
    onChange({ myNFTs: false, fixedPrice: false, timedAuction: false, myBets: false });
  }, [onChange]);

  return (
    <Accordion title={'Status'}
      isOpen={true}
      onClear={onClear}
      isClearShow={myNFTs || fixedPrice || timedAuction || myBets}
      testid={`${testid}-accordion`}
    >
      <StatusFilterWrapper>
        {selectedAccount && <Checkbox
          checked={!!myNFTs}
          label={'My NFTs on sale'}
          size={'m'}
          onChange={onMyNFTsChange}
          testid={`${testid}-myNft-checkbox`}
        />}
        <Checkbox
          checked={!!fixedPrice}
          label={'Fixed price'}
          size={'m'}
          onChange={onFixedPriceChange}
          testid={`${testid}-fixedPrice-checkbox`}
        />
        <Checkbox
          checked={!!timedAuction}
          label={'Timed auction'}
          size={'m'}
          onChange={onTimedAuctionChange}
          testid={`${testid}-timedAuction-checkbox`}
        />
        {selectedAccount && <Checkbox
          checked={!!myBets}
          label={'My bids'}
          size={'m'}
          onChange={onMyBetsChange}
          testid={`${testid}-myBids-checkbox`}
        />}
      </StatusFilterWrapper>
    </Accordion>
  );
};

const StatusFilterWrapper = styled.div`
  padding-top: var(--gap);
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
`;

export default StatusFilter;
