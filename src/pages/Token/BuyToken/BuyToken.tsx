import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';
import { BN } from '@polkadot/util';

import { useFee } from '../../../hooks/useFee';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from '../../../styles/colors';
import { Offer } from '../../../api/restApi/offers/types';
import { useAccounts } from '../../../hooks/useAccounts';
import { formatFiatPrice } from '../../../utils/textUtils';

interface BuyTokenProps {
  offer?: Offer;
  onBuy(): void
}

export const BuyToken: FC<BuyTokenProps> = ({ offer, onBuy }) => {
  const { marketCommission } = useFee();
  const { selectedAccount } = useAccounts();

  const isEnoughBalance = useMemo(() => {
    if (!selectedAccount?.balance?.KSM || selectedAccount.balance.KSM.isZero() || !offer?.price) return false;
    return selectedAccount.balance.KSM.gte(new BN(offer.price).add(new BN(marketCommission)));
  }, [offer?.price, selectedAccount?.balance?.KSM, marketCommission]);

  const onBuyClick = useCallback(() => {
    if (!isEnoughBalance && offer?.type !== 'Fiat') return;

    onBuy();
  }, [onBuy, isEnoughBalance, offer]);

  if (!offer) return null;

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer.price} isSellBlockchain={offer.type !== 'Fiat'} />
    <ButtonWrapper>
      <Button
        onClick={onBuyClick}
        role='primary'
        title='Buy'
        wide={true}
        disabled={(!isEnoughBalance && offer.type !== 'Fiat')}
      />
    </ButtonWrapper>
    {(!isEnoughBalance && offer.type !== 'Fiat') && <Text color={'coral-500'}>Your balance is too low to buy</Text>}
    <Divider />
  </>);
};

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) * 1.5);
  @media (max-width: 767px) {
    width: 100%;
  }
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
