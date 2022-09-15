import React, { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import CheckoutForm, { CardNumberFrame, CVVFrame, ExpiryDateFrame, ValidationChangeEvent } from '../../../components/CheckoutForm';
import { Button, Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { AdditionalDark, AdditionalLight, Coral700, Grey300, Grey500, Primary500, Secondary500 } from '../../../styles/colors';
import { ReactComponent as PaymentsIcon } from '../../../static/icons/payment-types.svg';
import { ReactComponent as CheckCircle } from '../../../static/icons/check-circle.svg';
import Warning from '../../../components/Warning/Warning';
import { useAccounts } from '../../../hooks/useAccounts';
import { DropdownSelect } from '../../../components/Header/WalletManager/AccountSelect/DropdownSelect';
import { Account } from '../../../account/AccountContext';
import AccountCard from '../../../components/Account/Account';
import config from '../../../config';
import { useCheckout } from '../../../api/restApi/checkout/checkout';
import { formatFiatPrice, formatKusamaBalance } from '../../../utils/textUtils';
import BN from 'bn.js';
import { useApi } from '../../../hooks/useApi';
import { FetchStatus } from '../../../api/restApi/checkout/types';

const CheckoutModal: FC<TTokenPageModalBodyProps> = ({ offer }) => {
  const [cardValid, setCardValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [cardToken, setCardToken] = useState('');
  const [errors, setErrors] = useState({
    'card-number': false,
    'expiry-date': false,
    cvv: false
  });
  const { accounts, selectedAccount } = useAccounts();
  const [walletAddress, setWalletAddress] = useState(selectedAccount?.address || '');
  const hasAccounts = useRef(accounts?.length > 0);
  const { payForTokenWithCard, paymentRequestStatus } = useCheckout();
  const { api } = useApi();

  const onCardValidationChanged = useCallback((valid: boolean): void => setCardValid(valid), []);
  const onFrameValidationChanged = useCallback((event: ValidationChangeEvent) => {
    const e = event.element;
    if (event.isValid || event.isEmpty) {
      setErrors((curErrors) => ({ ...curErrors, [e]: false }));
    } else {
      setErrors((curErrors) => ({ ...curErrors, [e]: true }));
    }
  }, []);
  const onCardSubmitted = useCallback((): void => setLoading(true), []);
  const onCardTokenized = useCallback(async (cardToken: string) => {
    // send request with tokenized card here
    setCardToken(cardToken);
    await payForTokenWithCard({
      tokenId: offer?.tokenId.toString() || '0',
      collectionId: offer?.collectionId.toString() || '0',
      tokenCard: cardToken,
      buyerAddress: walletAddress
    });
    setLoading(false);
    setPaymentCompleted(true);
  }, [offer, walletAddress, payForTokenWithCard]);

  return (
    <Content>
      {paymentCompleted
        ? <>
          <CompletedMessage paymentRequestStatus={paymentRequestStatus} />
        </>
        : <>
          <Heading size='2'>{`${offer && `Buy NFT for ${formatFiatPrice(offer.price)}$`}`}</Heading>
          <CheckoutForm
            publicKey={config.checkoutPublicKey || ''}
            onCardValidationChanged={onCardValidationChanged}
            onCardSubmitted={onCardSubmitted}
            onCardTokenized={onCardTokenized}
            onValidationChanged={onFrameValidationChanged}
          >
            <Field>
              <Label>Your crypto wallet address</Label>
              <p className='no-wallet-notion'>If you don&apos;t have a wallet yet, create one here.</p>
              <WalletField
                selectedAccount={selectedAccount}
                accounts={accounts}
                setWalletAddress={setWalletAddress}
                walletAddress={walletAddress}
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
            <Field>
              <Label>Card number</Label>
              <CardNumberFrame/>
              {errors['card-number'] && <Error>Wrong card number</Error>}
            </Field>
            <DateCodeRow>
              <Field>
                <Label>Expiry date</Label>
                <ExpiryDateFrame/>
                {errors['expiry-date'] && <Error>Wrong expiry date</Error>}
              </Field>
              <Field>
                <Label>CVV</Label>
                <CVVFrame/>
                {errors.cvv && <Error>Wrong CVV</Error>}
              </Field>
            </DateCodeRow>

            <Button
              type='submit'
              role='primary'
              title={!loading ? 'Pay' : 'Loading'}
              disabled={!cardValid || loading || !walletAddress}
            />
          </CheckoutForm>
        </>}
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
`;

const Field = styled.label`
  display: block;
  cursor: pointer;
  span {
    display: block;
  }
  .no-wallet-notion {
    font-size: 14px;
    line-height: 22px;
    font-feature-settings: 'pnum' on, 'lnum' on;
    color: ${Grey500};
    margin: 4px 0 16px;
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
  font-size: 11px;
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
}

const WalletField: FC<IWalletFieldProps> = ({ accounts, selectedAccount, setWalletAddress, walletAddress }) => {
  const [selectedWallet, setSelectedWallet] = useState(selectedAccount);
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
            renderOption={AccountOptionCard}
            onChange={onWalletSelected}
            options={accounts || []}
            value={selectedWallet}
            className={'account-select'}
        />
        : <input
            id={'wallet'}
            type={'text'}
            value={walletAddress}
            onChange={onWalletAddressChange}
        />
      }
    </>
  );
};

const AccountOptionCard: FC<Account> = (account) => {
  return (<AccountOptionWrapper>
    <AccountCard
      accountName={account.meta.name || ''}
      accountAddress={account.address}
      canCopy={false}
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
