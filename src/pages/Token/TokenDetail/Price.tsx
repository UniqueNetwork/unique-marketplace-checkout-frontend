import React, { FC, useMemo } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import BN from 'bn.js';
import styled from 'styled-components';
import { Icon } from 'components/Icon/Icon';

import { formatFiatPrice, formatKusamaBalance } from '../../../utils/textUtils';
import { useApi } from '../../../hooks/useApi';

const tokenSymbol = '$';

interface PriceProps {
  price: string;
  testid?: string;
  isSellBlockchain: boolean;
}

export const Price: FC<PriceProps> = ({ price, isSellBlockchain, testid = '' }) => {
  const { api } = useApi();
  const formattedPrice = useMemo(() => {
    if (isSellBlockchain) {
      return `${formatKusamaBalance(new BN(price).toString(), api?.market?.kusamaDecimals)}`;
    } else {
      return `${tokenSymbol}${formatFiatPrice(price).toString()}`;
    }
  }, [isSellBlockchain, price, api?.market?.kusamaDecimals]);

  return (
    <PriceWrapper>
      <Row>
        <Heading
          testid={`${testid}-price`}
          size={'1'}
        >{formattedPrice}</Heading>
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
