import { Heading, Icon, Text } from '@unique-nft/ui-kit';
import React, { FC, ReactChild, useCallback, useMemo } from 'react';
import styled from 'styled-components/macro';

import { Picture } from '../../../components';
import share from '../../../static/icons/share.svg';
import { CollectionsCard } from './CollectionsCard';
import { AttributesBlock } from './AttributesBlock';
import { NFTToken } from '../../../api/chainApi/unique/types';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { shortcutText } from '../../../utils/textUtils';
import { Grey300, Grey500, Primary600 } from '../../../styles/colors';
import { Avatar } from '../../../components/Avatar/Avatar';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import config from '../../../config';
import { useAccounts } from '../../../hooks/useAccounts';
import { isTokenOwner } from '../../../api/chainApi/utils/addressUtils';

interface IProps {
  children: ReactChild[];
  token: NFTToken;
}

export const CommonTokenDetail: FC<IProps> = ({
  children,
  token
}) => {
  const {
    collectionId,
    collectionName,
    description,
    attributes,
    imageUrl,
    owner,
    id: tokenId,
    prefix
  } = token;

  const { selectedAccount } = useAccounts();
  const deviceSize = useDeviceSize();

  const isOwner = useMemo(() => {
    if (!selectedAccount || !owner) return false;
    return isTokenOwner(selectedAccount.address, owner);
  }, [selectedAccount, owner]);

  const onShareClick = useCallback(() => {
    if (navigator.share) {
      void navigator.share({
        title: `NFT: ${prefix || ''} #${tokenId}`,
        url: window.location.href
      });
    }
  }, [prefix, tokenId]);

  return (
    <CommonTokenDetailStyled>
      <PictureWrapper>
        <Picture alt={tokenId.toString()} src={imageUrl} />
      </PictureWrapper>
      <Description>
        <Heading size={'1'}>{`${prefix || ''} #${tokenId}`}</Heading>
        <ShareLink onClick={onShareClick}>
          <Text color='grey-500' size='m'>
            Share Link
          </Text>
          <IconWrapper>
            <Icon file={share} size={24} />
          </IconWrapper>
        </ShareLink>
        <Row>
          {isOwner && <Text color='grey-500' size='m'>You own it</Text>}
          {!isOwner && <>
            <Text color='grey-500' size='m'>
              Owned&nbsp;by
            </Text>
            <Account href={`${config.scanUrl}account/${owner?.Substrate || ''}`}>
              <Avatar size={24} src={DefaultAvatar}/>
              <Text color='primary-600' size='m'>
                {deviceSize === DeviceSize.lg ? owner?.Substrate || '' : shortcutText(owner?.Substrate || '') }
              </Text>
            </Account>
          </>}
        </Row>
        <Divider />
        {children}
        <AttributesBlock attributes={attributes} />
        <Divider />
        <CollectionsCard
          avatarSrc={''}
          description={description || ''}
          id={collectionId || -1}
          title={collectionName || ''}
        />
      </Description>
    </CommonTokenDetailStyled>
  );
};

const CommonTokenDetailStyled = styled.div`
  display: flex;
  width: 100%;

  > div:first-of-type {
    width: 44%;
    margin-right: 32px;

    @media (max-width: 568px) {
      width: 100%;
    }
  }

  @media (max-width: 568px) {
    flex-direction: column;
    row-gap: var(--gap);
  }
`;

const IconWrapper = styled.div`
  margin-left: 4px;
  margin-right: 16px;

  svg {
    fill: ${Grey500};
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      min-width: 224px;
    }

    @media (max-width: 567px) {
      width: 100%;
    }
    
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;

  && h1 {
    margin-bottom: 0;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ShareLink = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--gap);
  cursor: pointer;
`;

const Account = styled.a`
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  color: ${Primary600};
  span {
    margin-left: 8px;
  }
`;

const Divider = styled.div`
  margin: 24px 0;
  border-top: 1px dashed ${Grey300};
`;
