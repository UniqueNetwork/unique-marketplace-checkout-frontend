import React, { FC, useCallback, useMemo } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';
import { BN } from '@polkadot/util';

import { useFee } from 'hooks/useFee';
import { Price } from '../TokenDetail/Price';
import { Grey300 } from 'styles/colors';
import { Offer } from 'api/restApi/offers/types';
import { useAccounts } from 'hooks/useAccounts';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import { getRemains } from 'utils/uiUtils';

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

  const [remains, max] = getRemains(offer.copiesCount);

  return (<>
    <Text size={'l'}>Price</Text>
    <Price price={offer.price} isSellBlockchain={offer.type !== 'Fiat'} />
    <RemainingWrapper>
      <Text color={'grey-500'}>Remaining NFTs</Text>
      <IconWithHint>When you purchase tokens from a limited set the number of available tokens is reduced by the number of tokens you purchase.</IconWithHint>
      <Text>{`${remains}/${max}`}</Text>
    </RemainingWrapper>

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

const RemainingWrapper = styled.div`
  margin-top: calc(var(--gap) / 2);
  display: flex;
  align-items: center;
  &>div {
    margin-left: calc(var(--gap) / 4);
    margin-right: calc(var(--gap) / 2);
  }
`;
