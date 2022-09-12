import React, { FC } from 'react';
import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components';

import { formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

interface PriceProps {
  price: string;
  testid?: string;
  isSellBlockchain: boolean;
}

export const Price: FC<PriceProps> = ({ price, isSellBlockchain, testid = '' }) => {
  const { api } = useApi();

  return (
    <PriceWrapper>
      <Row>
        <Heading
          testid={`${testid}-price`}
          size={'1'}
        >{`${formatKusamaBalance(new BN(price).toString(), api?.market?.kusamaDecimals)}${!isSellBlockchain ? '$' : ''}`}</Heading>
        {isSellBlockchain && <Icon name={'chain-kusama'} size={32} />}
      </Row>
    </PriceWrapper>
  );
};

const PriceWrapper = styled.div`
  
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  && h1 {
    margin-bottom: 0;
  }
`;
