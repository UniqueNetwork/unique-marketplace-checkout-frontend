import React, { FC, useMemo } from 'react';
import { Icon, Text } from '@unique-nft/ui-kit';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Offer } from 'api/restApi/offers/types';
import { useAccounts } from 'hooks/useAccounts';
import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import { formatKusamaBalance } from 'utils/textUtils';
import { timeDifference } from 'utils/timestampUtils';
import { Primary600 } from 'styles/colors';
import config from '../../config';
import { TokensMedia } from '../TokensCard/TokensMedia';

export type TTokensCard = {
  offer: Offer
  testid: string
};

export const OfferCard: FC<TTokensCard> = ({ offer, testid }) => {
  const { selectedAccount } = useAccounts();

  const {
    collectionName,
    image,
    prefix,
    video
  } = offer?.tokenDescription || {};

  const videoProp = useMemo(() => typeof video === 'string' ? { fullUrl: video, ipfsCid: '' } : video, [video]);

  const isBidder = useMemo(() => {
    if (!selectedAccount) return false;
    return offer?.auction?.bids.some((bid) => compareEncodedAddresses(bid.bidderAddress, selectedAccount.address));
  }, [offer, selectedAccount]);

  const topBid = useMemo(() => {
    if (!offer?.auction?.bids?.length) return null;
    return offer?.auction?.bids[0].balance;
  }, [offer]);

  const isTopBidder = useMemo(() => {
    if (!selectedAccount || !isBidder || !topBid) return false;
    return compareEncodedAddresses(offer?.auction!.bids[0].bidderAddress, selectedAccount.address);
  }, [isBidder, topBid, selectedAccount]);

  return (
    <TokensCardStyled>
      <TokensMedia
        to={`/token/${offer?.collectionId}/${offer?.tokenId}`}
        tokenId={offer?.tokenId}
        imageUrl={image}
        video={videoProp}
        testid={`${testid}-token-media`}
      />
      <Description>
        <Link to={`/token/${offer?.collectionId}/${offer?.tokenId}`} title={`${prefix || ''} #${offer?.tokenId}`}>
          <Text
            size='l'
            weight='regular'
            color={'secondary-500'}
            testid={`${testid}-tokenId`}
          >
            {`${prefix || ''} #${offer?.tokenId}`}
          </Text>
        </Link>
        <a
          data-testid={`${testid}-collection-${offer?.collectionId}-link`}
          href={`${config.scanUrl || ''}collections/${offer?.collectionId}`}
          target={'_blank'}
          rel='noreferrer'
        >
          <Text color='primary-600' size='s'>
            {`${collectionName?.substring(0, 25) || ''} [id ${offer?.collectionId || ''}]`}
          </Text>
        </a>
        <PriceWrapper>
          <Text
            testid={`${testid}-price`}
            size='l'
          >{topBid ? `${formatKusamaBalance(Number(topBid))}` : `${formatKusamaBalance(offer?.price)}` }</Text>
          {offer.isSellBlockchain ? <Icon name={'chain-kusama'} size={16}/> : <Text size='s'>$</Text>}
        </PriceWrapper>
        {!offer?.auction && <Text size={'xs'} color={'grey-500'} >Price</Text>}
        {offer?.auction && <AuctionInfoWrapper>
          {isTopBidder && <Text
            testid={`${testid}-leading-bid`}
            size={'xs'}
            color={'additional-positive-500'}
          >Leading bid</Text>}
          {isBidder && !isTopBidder && <Text
            testid={`${testid}-outbid`}
            size={'xs'}
            color={'coral-500'}
          >Outbid</Text>}
          {!isBidder && !isTopBidder && <Text
            testid={`${testid}-bids`}
            size={'xs'}
            color={'grey-500'}
          >{
            offer.auction.bids.length > 0 ? 'Last bid' : 'Minimum bid'
          }</Text>}
          <StyledText color={'dark'} size={'xs'}>{`${timeDifference(new Date(offer.auction?.stopAt || '').getTime() / 1000)} left`}</StyledText>
        </AuctionInfoWrapper>}
      </Description>
    </TokensCardStyled>
  );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  position: relative;
  cursor: pointer;
`;

const PictureWrapper = styled(Link)`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;

  &::before {
    content: "";
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
    transition: 50ms;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }
    
    &:hover {
      transform: translate(0, -5px);
      text-decoration: none;
    }
  }
`;

const PriceWrapper = styled.div` 
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
  margin-top: calc(var(--gap) / 2);
`;

const StyledText = styled(Text)` 
  && {
    color: var(--color-additional-dark);
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;

  span {
    color: ${Primary600};
  }
`;

const AuctionInfoWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;

const Row = styled.div` 
  && {
    display: flex;
    align-items: center;
    column-gap: calc(var(--gap) / 4);
  }
`;
