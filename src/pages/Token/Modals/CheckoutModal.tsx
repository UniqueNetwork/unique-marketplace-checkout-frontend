import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import CheckoutForm, { CardNumberFrame, CVVFrame, ExpiryDateFrame, ValidationChangeEvent } from 'components/CheckoutForm';
import { Button, Text, useNotifications } from 'components/UI';
import { Heading, Loader, Link as UILink } from '@unique-nft/ui-kit';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { AdditionalDark, AdditionalLight, Coral700, Grey300, Grey500, Primary500, Secondary500 } from 'styles/colors';
import { ReactComponent as PaymentsIcon } from 'static/icons/payment-types.svg';
import { ReactComponent as CheckCircle } from 'static/icons/check-circle.svg';
import Warning from 'components/Warning/Warning';
import { useAccounts } from 'hooks/useAccounts';
import { DropdownSelect } from 'components/Header/WalletManager/AccountSelect/DropdownSelect';
import { Account } from 'account/AccountContext';
import AccountCard from 'components/Account/Account';
import config from 'config';
import { useCheckout } from 'api/restApi/checkout/checkout';
import { formatFiatPrice } from 'utils/textUtils';
import { FetchStatus } from 'api/restApi/checkout/types';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { checkAddress } from '@polkadot/util-crypto';
import { useApi } from 'hooks/useApi';

const CheckoutModal: FC<TTokenPageModalBodyProps> = ({ offer, onFinish }) => {
  const [cardValid, setCardValid] = useState(false);
  const [isCheckoutFromReady, setIsCheckoutFromReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errors, setErrors] = useState({
    'card-number': false,
    'expiry-date': false,
    cvv: false
  });
  const { accounts, selectedAccount } = useAccounts();
  const [walletAddress, setWalletAddress] = useState(selectedAccount?.address || '');
  const hasAccounts = useRef(accounts?.length > 0);
  const { payForTokenWithCard, paymentRequestStatus } = useCheckout();
  const { chainData } = useApi();
  const { info } = useNotifications();

  const isAddressValid = useMemo(() => {
    const [isValid] = checkAddress(walletAddress, chainData?.SS58Prefix || 255);
    if (isValid) return true;
    // we should also always allow 42's
    const [is42Valid] = checkAddress(walletAddress, 42);
    return is42Valid;
  }, [walletAddress, chainData?.SS58Prefix]);

  const onCardValidationChanged = useCallback((valid: boolean): void => setCardValid(valid), []);
  const onFrameValidationChanged = useCallback((event: ValidationChangeEvent) => {
    const e = event.element;
    if (event.isValid || event.isEmpty) {
      setErrors((curErrors) => ({ ...curErrors, [e]: false }));
    } else {
      setErrors((curErrors) => ({ ...curErrors, [e]: true }));
    }
  }, []);
  const onFormReady = useCallback((): void => setIsCheckoutFromReady(true), []);
  const onCardSubmitted = useCallback((): void => setLoading(true), []);
  const onCardTokenized = useCallback(async (cardToken: string) => {
    if (!offer) return;

    const { tokenId, collectionId } = offer;

    // send request with tokenized card here
    await payForTokenWithCard({
      tokenId: tokenId.toString() || '0',
      collectionId: collectionId.toString() || '0',
      tokenCard: cardToken,
      buyerAddress: walletAddress
    });

    setLoading(false);
    setPaymentCompleted(true);

    onFinish();
  }, [offer, hasAccounts, walletAddress, payForTokenWithCard, onFinish]);

  useEffect(() => {
    if (!offer || paymentRequestStatus !== FetchStatus.success) return;
    const { tokenId, collectionId, tokenDescription } = offer;
    info(
      <div data-testid={'success-notification'}>You are the new owner of <UILink href={`/token/${collectionId || ''}/${tokenId || ''}`} title={`${tokenDescription?.prefix || ''} #${tokenId || ''}`}/></div>,
      { name: 'success', size: 32, color: 'var(--color-additional-light)' }
    );
  }, [paymentRequestStatus, offer]);

  return (
    <Content>
      {paymentCompleted
        ? <>
          <CompletedMessage paymentRequestStatus={paymentRequestStatus} />
        </>
        : <>
          <Heading size='2'>{`${offer && `Buy NFT for $${formatFiatPrice(offer.price)}`}`}</Heading>
          <CheckoutForm
            publicKey={config.checkoutPublicKey || ''}
            onCardValidationChanged={onCardValidationChanged}
            onCardSubmitted={onCardSubmitted}
            onCardTokenized={onCardTokenized}
            onValidationChanged={onFrameValidationChanged}
            onFormActive={onFormReady}
          >
            <Field>
              <Label>Your crypto wallet address</Label>
              <p className='no-wallet-notion'>If you don&apos;t have a wallet yet, create one <Link to={'/accounts'}>here</Link>.</p>
              <WalletField
                selectedAccount={selectedAccount}
                accounts={accounts}
                setWalletAddress={setWalletAddress}
                walletAddress={walletAddress}
                isValidAddress={isAddressValid}
              />
            </Field>
            {!hasAccounts.current && <WarningsContainer>
              <Warning>Proceed with caution, once confirmed the transaction cannot be reverted.</Warning>
              <Warning>Make sure to use a Substrate address created with a Polkadot.&#123;js&#125; wallet. There is no
                guarantee that third-party wallets, exchanges or hardware wallets can successfully sign and process your
                transfer which will result in a possible loss of the NFT.</Warning>
            </WarningsContainer>}
            <PaymentHeader>
              <Heading size='4'>Payment details</Heading>
              <PaymentsIcon />
            </PaymentHeader>
            <PaymentWrapper>
              {!isCheckoutFromReady && <FormReadyLoaderWrapper><Loader /></FormReadyLoaderWrapper>}
              <Field isReady={isCheckoutFromReady}>
                <Label>Card number</Label>
                <CardNumberFrame/>
                {errors['card-number'] && <Error>Wrong card number</Error>}
              </Field>
              <DateCodeRow>
                <Field isReady={isCheckoutFromReady}>
                  <Label>Expiry date</Label>
                  <ExpiryDateFrame/>
                  {errors['expiry-date'] && <Error>Wrong expiry date</Error>}
                </Field>
                <Field isReady={isCheckoutFromReady}>
                  <Label>CVV</Label>
                  <CVVFrame/>
                  {errors.cvv && <Error>Wrong CVV</Error>}
                </Field>
              </DateCodeRow>
            </PaymentWrapper>
            <Button
              type='submit'
              role='primary'
              title={'Pay'}
              disabled={!cardValid || loading || !walletAddress || !isAddressValid}
            />
          </CheckoutForm>
        </>}
      {loading && <LoaderWrapper><Loader /></LoaderWrapper>}
    </Content>
  );
};

const Content = styled.div`
  && h2 {
    margin-bottom: 32px;
  }
  button {
    float: right;
  
  }
  @media (max-width: 568px) {
    button {
      width: 100%;
    }
  }
`;

const LoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
`;

const PaymentWrapper = styled.div`
  position: relative;
`;

const FormReadyLoaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
`;

const Field = styled.label<{ isReady?: boolean }>`
  visibility: ${({ isReady = true }) => isReady ? 'visible' : 'hidden'};
  display: block;
  span {
    display: block;
  }
  .no-wallet-notion {
    font-size: 14px;
    line-height: 22px;
    font-feature-settings: 'pnum' on, 'lnum' on;
    color: ${Grey500};
    margin: 4px 0 16px;
    a {
      color: ${Grey500};
      text-decoration: underline;
      cursor: pointer;
    }
  }
  #wallet {
    color: ${Secondary500};
    letter-spacing: 0;
    padding: 8px 16px;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    background: ${AdditionalLight};
    border: 1px solid ${Grey300};
    border-radius: 4px;
    width: calc(100% - 32px);
  }
  #wallet:focus {
    border: 1px solid ${Primary500};
    outline: none;
  }
  
  .account-select {
    border: 1px solid ${Grey300};
    border-radius: 4px;
  }

  .unique-text[class*=color-grey-500] {
    font-size: 16px;
    line-height: 24px;
    color: ${AdditionalDark};
  }
  
  .account-select > div {
    width: 100%;
  }
`;

const Label = styled.span`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  font-feature-settings: 'pnum' on, 'lnum' on;
  color: ${AdditionalDark};
`;

const WarningsContainer = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PaymentHeader = styled.div`
  margin: 40px 0 24px;
  .unique-font-heading.size-4 {
    margin-bottom: 16px;
  }
`;

const DateCodeRow = styled.div`
  display: flex;
  gap: 24px;
  margin: 24px 0 32px;
`;

const Error = styled.span`
  position: absolute;
  color: ${Coral700};
  font-size: 12px;
  margin-top: calc(var(--gap) / 4);
`;

export default CheckoutModal;

const CompletedMessage = ({ paymentRequestStatus }: {paymentRequestStatus: string}) => {
  return (
    <MessageWrapper>
      <Heading size='2'>{paymentRequestStatus === FetchStatus.success ? 'Payment completed' : 'Payment failed'}</Heading>
      {paymentRequestStatus === FetchStatus.success && <Message>
        <CheckCircle/>
        <p>Your data has been successfully sent. <br/> Please wait a few minutes. NFT will be available in your wallet
          soon</p>
      </Message>}
    </MessageWrapper>
  );
};

const Message = styled.div`
  display: flex;
  margin-top: 16px;
  gap: 18px;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const MessageWrapper = styled.div`
  && h2 {
    margin-bottom: 16px;
  }
`;

interface IWalletFieldProps {
  accounts: Account[],
  selectedAccount: Account | undefined,
  setWalletAddress: (address: string) => void,
  walletAddress: string
  isValidAddress: boolean
}

const WalletField: FC<IWalletFieldProps> = ({ accounts, selectedAccount, setWalletAddress, walletAddress, isValidAddress }) => {
  const [selectedWallet, setSelectedWallet] = useState(selectedAccount);
  const deviceSize = useDeviceSize();
  const onWalletAddressChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(target.value);
  }, [setWalletAddress]);

  const onWalletSelected = useCallback(
    (wallet: Account) => {
      setSelectedWallet(wallet);
      setWalletAddress(wallet?.address || '');
    },
    [setSelectedWallet, setWalletAddress]
  );
  return (
    <>
      {accounts.length > 0
        ? <DropdownSelect
          renderOption={(option) => (<AccountOptionCard {...option} isShort={deviceSize < DeviceSize.md} />)}
          onChange={onWalletSelected}
          options={accounts || []}
          value={selectedWallet}
          className={'account-select'}
        />
        : <>
          <input
            id={'wallet'}
            type={'text'}
            value={walletAddress}
            onChange={onWalletAddressChange}
          />
          {!isValidAddress && walletAddress && <ErrorWrapper size={'s'} color={'var(--color-coral-500)'} >Address is not valid</ErrorWrapper>}
        </>
      }
    </>
  );
};

const AccountOptionCard: FC<Account & { isShort: boolean }> = ({ meta, address, isShort }) => {
  return (<AccountOptionWrapper>
    <AccountCard
      accountName={meta.name || ''}
      accountAddress={address}
      canCopy={false}
      isShort={isShort}
      hideName
    />
  </AccountOptionWrapper>);
};

const AccountOptionWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  cursor: pointer;
  align-items: center;
`;

const ErrorWrapper = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  display: block;
`;
