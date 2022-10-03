import { Button, Heading, Link, useNotifications } from '@unique-nft/ui-kit';
import React, { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import DefaultMarketStages from './StagesModal';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import { TAuctionProps, TFixPriceProps } from './types';
import { useAuctionSellStages } from '../../../hooks/marketplaceStages';
import { useAccounts } from '../../../hooks/useAccounts';
import { StageStatus } from '../../../types/StagesTypes';
import { NumberInput } from 'components/NumberInput/NumberInput';
import { useFiatSellFixStages } from '../../../hooks/marketplaceStages/useFiatSellFixStages';

const tokenSymbol = '$';

export const SellModal: FC<TTokenPageModalBodyProps> = ({ token, onFinish, setIsClosable, testid }) => {
  const { collectionId, id: tokenId } = token || {};
  const [status, setStatus] = useState<'ask' | 'auction-stage' | 'fix-price-stage'>('ask'); // TODO: naming
  const [auction, setAuction] = useState<TAuctionProps>();
  const [fixPrice, setFixPrice] = useState<TFixPriceProps>();

  const onSellAuction = useCallback((auction: TAuctionProps) => {
      setAuction(auction);
      setStatus('auction-stage');
      setIsClosable(false);
  }, [setStatus, setAuction, setIsClosable]);

  const onSellFixPrice = useCallback((fixPrice: TFixPriceProps) => {
    setFixPrice(fixPrice);
    setStatus('fix-price-stage');
    setIsClosable(false);
  }, [setStatus, setFixPrice, setIsClosable]);

  if (!token) return null;

  if (status === 'ask') return (<AskSellModal onSellAuction={onSellAuction} onSellFixPrice={onSellFixPrice} testid={`${testid}-sell-ask`} />);
  switch (status) {
    case 'auction-stage':
      return (<SellAuctionStagesModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={token?.prefix || ''}
        auction={auction as TAuctionProps}
        onFinish={onFinish}
        testid={`${testid}-sell-auction`}
      />);
    case 'fix-price-stage':
      return (<SellFiatFixStagesModal
        collectionId={collectionId || 0}
        tokenId={tokenId || 0}
        tokenPrefix={token?.prefix || ''}
        sellFix={fixPrice as TFixPriceProps}
        onFinish={onFinish}
        testid={`${testid}-sell-fix`}
      />);
    default: throw new Error(`Incorrect status provided for processing modal: ${status as string}`);
  }
};

type TOnSellAuction = (auction: TAuctionProps) => void;
type TOnSellFix = (price: TFixPriceProps) => void;
type TAskSellModalProps = {
  onSellAuction: TOnSellAuction,
  onSellFixPrice: TOnSellFix,
  testid: string
}

export const AskSellModal: FC<TAskSellModalProps> = ({ onSellFixPrice, testid }) => {
  const { selectedAccount } = useAccounts();
  const [priceInputValue, setPriceInputValue] = useState<string>();

  const onPriceInputChange = useCallback((value: string) => {
      setPriceInputValue(value);
    },
    [setPriceInputValue]
  );

  const onConfirmFixPriceClick = useCallback(() => {
    if (!selectedAccount || !priceInputValue || !Number(priceInputValue)) return;

    onSellFixPrice({ price: priceInputValue, accountAddress: selectedAccount.address } as TFixPriceProps); // TODO: proper typing, proper calculated object
  }, [priceInputValue, selectedAccount, onSellFixPrice]);

  return (
    <SellModalStyled>
      <Content>
        <Heading size='2'>List item for sale</Heading>
      </Content>
      <InputWrapper
        label={`Price (${tokenSymbol})*`}
        onChange={onPriceInputChange}
        value={priceInputValue?.toString()}
        testid={`${testid}-price-input`}
        decimals={2}
      />
      <ButtonWrapper>
        <Button
          disabled={!priceInputValue || !Number(priceInputValue)}
          onClick={onConfirmFixPriceClick}
          role='primary'
          title='Confirm'
          testid={`${testid}-confirm-button`}
        />
      </ButtonWrapper>
    </SellModalStyled>
  );
};

type TSellFixStagesModal = {
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  sellFix: TFixPriceProps
  testid: string
}

type TSellAuctionStagesModal = {
  onFinish: () => void
  collectionId: number
  tokenId: number
  tokenPrefix: string
  auction: TAuctionProps
  testid: string
}

export const SellFiatFixStagesModal: FC<TSellFixStagesModal> = ({ collectionId, tokenId, tokenPrefix, sellFix, onFinish, testid }) => {
  const { stages, status, initiate } = useFiatSellFixStages(collectionId, tokenId);
  const { info } = useNotifications();

  useEffect(() => { initiate(sellFix); }, [sellFix]);

  useEffect(() => {
    if (status === StageStatus.success) {
      info(
        <div data-testid={`${testid}-success-notification`}><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> offered for sale</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={`${testid}`}
      />
    </div>
  );
};

export const SellAuctionStagesModal: FC<TSellAuctionStagesModal> = ({ collectionId, tokenId, tokenPrefix, auction, onFinish, testid }) => {
  const { stages, status, initiate } = useAuctionSellStages(collectionId, tokenId);
  const { info } = useNotifications();

  useEffect(() => { initiate(auction); }, [auction]); //

  useEffect(() => {
    if (status === StageStatus.success) {
      info(<div data-testid={`${testid}-success-notification`}><Link href={`/token/${collectionId}/${tokenId}`} title={`${tokenPrefix} #${tokenId}`}/> is up for auction</div>, { name: 'success', size: 32, color: 'var(--color-additional-light)' });
    }
  }, [status]);

  return (
    <div>
      <DefaultMarketStages
        stages={stages}
        status={status}
        onFinish={onFinish}
        testid={`${testid}`}
      />
    </div>
  );
};

const InputWrapper = styled(NumberInput)`
  margin-bottom: 32px;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const SellModalStyled = styled.div`
  width: 100%;

  .unique-input-text, div[class^=NumberInput] {
    width: 100%;
  }

  .unique-select {
    margin-left: 24px;
  }

  .unique-select .select-wrapper > svg {
    z-index: 0;
  }

  .unique-tabs-contents {
    padding-top: 32px;
    padding-bottom: 0;
  }

  .unique-tabs-labels {
    margin-top: 16px;
  }
`;
