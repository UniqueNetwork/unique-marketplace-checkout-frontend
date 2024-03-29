import React, { FC, useCallback } from 'react';
import { Checkbox } from 'components/UI';
import styled from 'styled-components';
import { MyTokensStatuses } from './types';
import Accordion from '../../../components/Accordion/Accordion';

interface StatusFilterProps {
  value: MyTokensStatuses | undefined
  onChange(value: MyTokensStatuses): void
  testid: string
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, testid }) => {
  const { onSell, fixedPrice, timedAuction, notOnSale } = value || {};

  const onMyNFTsOnSellChange = useCallback((value: boolean) => {
    onChange({ onSell: value, fixedPrice, timedAuction, notOnSale });
  }, [fixedPrice, timedAuction, notOnSale, onChange]);

  const onFixedPriceChange = useCallback((value: boolean) => {
    onChange({ onSell, fixedPrice: value, timedAuction, notOnSale });
  }, [onSell, timedAuction, notOnSale, onChange]);

  const onTimedAuctionChange = useCallback((value: boolean) => {
    onChange({ onSell, fixedPrice, timedAuction: value, notOnSale });
  }, [onSell, fixedPrice, notOnSale, onChange]);

  const onNotOnSaleChange = useCallback((value: boolean) => {
    onChange({ onSell, fixedPrice, timedAuction, notOnSale: value });
  }, [onSell, fixedPrice, timedAuction, onChange]);

  const onClear = useCallback(() => {
    onChange({ onSell: false, fixedPrice: false, timedAuction: false, notOnSale: false });
  }, [onChange]);

  return (
    <Accordion title={'Status'}
      isOpen={true}
      onClear={onClear}
      isClearShow={onSell || fixedPrice || timedAuction || notOnSale}
      testid={`${testid}-accordion`}
    >
      <StatusFilterWrapper>
        <Checkbox
          checked={!!onSell}
          label={'My NFTs on sale'}
          size={'m'}
          onChange={onMyNFTsOnSellChange}
          testid={`${testid}-myNft-checkbox`}
        />
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
        <Checkbox
          checked={!!notOnSale}
          label={'Not on sale'}
          size={'m'}
          onChange={onNotOnSaleChange}
          testid={`${testid}-notOnSale-checkbox`}
        />
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
