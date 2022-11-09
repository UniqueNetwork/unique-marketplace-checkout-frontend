import React, { FC } from 'react';
import styled from 'styled-components';
import { Button, Text } from 'components/UI';

import { Grey300 } from 'styles/colors';
import { Offer } from 'api/restApi/offers/types';
import { Price } from '../TokenDetail/Price';
import { useApi } from 'hooks/useApi';
import { useAdminLoggingIn } from '../../../api/restApi/admin/login';

interface SellTokenProps {
  offer?: Offer
  isAllowed?: boolean
  onSellClick(): void
  onTransferClick(): void
  onDelistClick(): void
  testid: string
}

export const SellToken: FC<SellTokenProps> = ({ offer, isAllowed, onSellClick, onTransferClick, onDelistClick, testid }) => {
  const { settings } = useApi();
  const { hasAdminPermission } = useAdminLoggingIn();

  if (offer) {
    return (<>
      <Text size={'l'}>{'Price'}</Text>
      <Price testid={testid} price={offer.price} isSellBlockchain={offer.type !== 'Fiat'} />
      <ButtonWrapper>
        <Button
          title={'Delist'}
          role={'danger'}
          onClick={onDelistClick}
          testid={`${testid}-delist-button`}
        />
      </ButtonWrapper>
      <Divider />
    </>);
  }

  if (!isAllowed) return null;

  return (
    <>
      <ActionsWrapper>
        {(settings?.marketType !== 'primary' || hasAdminPermission) && <Button title={'Sell'} role={'primary'} onClick={onSellClick}/>}
        <Button
          title={'Transfer'}
          onClick={onTransferClick}
          testid={`${testid}-transfer-button`}
        />
      </ActionsWrapper>
      <Divider />
    </>
  );
};

const ActionsWrapper = styled.div`
  display: flex;
  column-gap: var(--gap);
`;

const ButtonWrapper = styled.div`
  width: 200px;
  margin-top: calc(var(--gap) * 1.5);
`;

const Divider = styled.div`
  margin: calc(var(--gap) * 1.5) 0;
  border-top: 1px dashed ${Grey300};
`;
