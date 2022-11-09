import React, { ReactNode, useEffect } from 'react';
import { IAccount } from '../AccountsManager';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { Avatar } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Icon, Text } from 'components/UI';

interface AccountCardProps extends IAccount {
  avatarRender?(address: string): ReactNode;
  onCopyAddressClick?(address: string): void
}

export const AccountCard = ({
    name,
    address,
    avatarRender,
    onCopyAddressClick
  }: AccountCardProps) => {
  const shortAddress =
    address && address?.length > 13
      ? `${address.slice(0, 5)}...${address.slice(-5)}`
      : address;

  const [copied, copy] = useCopyToClipboard();

  useEffect(() => {
    copied && onCopyAddressClick?.(copied);
  }, [copied]);

  return (
    <AccountCardWrapper>
      {avatarRender && address
        ? (
          avatarRender(address)
        )
        : (
          <Avatar src={DefaultAvatar} type='circle' />
        )}
      <div className='account-card-content'>
        <Text size='m'>{name}</Text>
        <div className='account-card-address'>
          <Text size='s' color='grey-500'>
            {shortAddress}
          </Text>
          <div
            className='address-copy'
            onClick={(event) => {
              event.stopPropagation();
              copy(address!);
            }}
            data-testid={`address-copy-${address}`}
          >
            <Icon size={16} name='copy' />
          </div>
        </div>
      </div>
    </AccountCardWrapper>
  );
};

const AccountCardWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) / 2);
  .account-card-content {
    display: flex;
    flex-direction: column;
    &>.unique-text {
      max-width: 130px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .account-card-address {
      display: flex;
      align-items: center;
      column-gap: calc(var(--prop-gap) / 4);
    }
  }
`;
