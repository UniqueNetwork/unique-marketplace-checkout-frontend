import React, { FC, useCallback, useContext, useMemo } from 'react';

import { NFTToken } from 'api/uniqueSdk/types';
import { Offer } from '../../../api/restApi/offers/types';
import accountContext from '../../../account/AccountContext';
import { SellToken } from '../SellToken/SellToken';
import { BuyToken } from '../BuyToken/BuyToken';
import Auction from '../Auction/Auction';
import { isTokenOwner } from 'api/uniqueSdk/utils/addressUtils';
import { useApi } from '../../../hooks/useApi';
import { checkAllowedTokenInSettings } from 'api/uniqueSdk/utils/checkTokenIsAllowed';
import { useAdminLoggingIn } from '../../../api/restApi/admin/login';
import { useAccounts } from '../../../hooks/useAccounts';
import { useNotifications } from '@unique-nft/ui-kit';

interface TokenTradingProps {
  token?: NFTToken
  offer?: Offer
  onSellClick(): void
  onBuyClick(): void
  onTransferClick(): void
  onPlaceABidClick(): void
  onDelistClick(): void
  onDelistAuctionClick(): void
  onWithdrawClick(): void
  onAuctionClose(newOwnerAddress: string): void
  testid: string
}

export const TokenTrading: FC<TokenTradingProps> = ({ token, offer, onSellClick, onTransferClick, onDelistClick, onDelistAuctionClick, onPlaceABidClick, onWithdrawClick, onBuyClick, onAuctionClose, testid }) => {
  const { selectedAccount } = useContext(accountContext);
  const { settings } = useApi();
  const { getJWToken } = useAdminLoggingIn();
  const { isLoading: isAccountsLoading } = useAccounts();
  const { warning } = useNotifications();

  const isAllowed = useMemo(() => {
    if (offer) {
      return checkAllowedTokenInSettings(offer.tokenId, offer.collectionId, settings);
    }
    return token?.isAllowed;
  }, [settings, token, offer]);

  const isOwner = useMemo(() => {
    if (!selectedAccount) return false;
    if (offer) {
      return isTokenOwner(selectedAccount.address, offer.seller);
    }
    return token?.owner ? isTokenOwner(selectedAccount.address, token.owner) : false;
  }, [selectedAccount, token, offer]);

  const checkAdminPermission = useCallback(() => {
    if (isAccountsLoading) return;
    void (async () => {
      const jwtoken = await getJWToken();
      if (!jwtoken) {
        warning(
          'Unable to login, please try again!',
          { name: 'warning', size: 32, color: 'var(--color-additional-light)' }
        );
        return;
      }
      onSellClick();
    })();
  }, [isAccountsLoading, onSellClick, getJWToken, warning]);

  if (offer?.auction) {
    return (<Auction
      offer={offer}
      onPlaceABidClick={onPlaceABidClick}
      onWithdrawClick={onWithdrawClick}
      onDelistAuctionClick={onDelistAuctionClick}
      onClose={onAuctionClose}
      testid={`${testid}-auction`}
    />);
  }

  if (isOwner) {
    return (<SellToken
      offer={offer}
      isAllowed={isAllowed}
      onSellClick={checkAdminPermission}
      onTransferClick={onTransferClick}
      onDelistClick={onDelistClick}
      testid={`${testid}-sell`}
    />);
  }

  if (!isAllowed) return null;

  return (
    <BuyToken offer={offer} onBuy={onBuyClick}/>
  );
};
