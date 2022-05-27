import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { TTokenPageModalBodyProps } from './TokenPageModal';
import CheckoutForm, { CardNumberFrame, CVVFrame, ExpiryDateFrame, ValidationChangeEvent } from '../../../components/CheckoutForm';
import { Button, Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { AdditionalLight, BlueGrey500, Coral700, Primary500, Secondary500 } from '../../../styles/colors';

const CheckoutModal: FC<TTokenPageModalBodyProps> = () => {
  const [cardValid, setCardValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardToken, setCardToken] = useState('');
  const [errors, setErrors] = useState({
    'card-number': false,
    'expiry-date': false,
    cvv: false
  });
  const [wallet, setWallet] = useState('');

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
  const onCardTokenized = useCallback((token: string): void => {
    // send request with tokenized card here
    setLoading(false);
    setCardToken(token);
  }, []);

  const onWalletChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    setWallet(target.value);
  }, []);

  return (
    <>
      <Content>
        <Heading size='2'>Buy token</Heading>
      </Content>
      <CheckoutForm
        publicKey='pk_test_1a2d17ad-83cb-4c06-aa02-4f937afd5cfa'
        onCardValidationChanged={onCardValidationChanged}
        onCardSubmitted={onCardSubmitted}
        onCardTokenized={onCardTokenized}
        onValidationChanged={onFrameValidationChanged}
      >
        <Field>
          <span>Wallet address:</span>
          <input
            id={'wallet'}
            type={'text'}
            value={wallet}
            onChange={onWalletChange}
          />
        </Field>
        <Field>
          <span>Card number:</span>
          <CardNumberFrame/>
          {errors['card-number'] && <Error>Wrong card number</Error>}
        </Field>
        <DateCodeRow>
          <DateCodeField>
            <span>Expiry date:</span>
            <ExpiryDateFrame/>
            {errors['expiry-date'] && <Error>Wrong expiry date</Error>}
          </DateCodeField>
          <DateCodeField>
            <span>CVV:</span>
            <CVVFrame/>
            {errors.cvv && <Error>Wrong CVV</Error>}
          </DateCodeField>
        </DateCodeRow>

        <Button
          type='submit'
          role='primary'
          title={!loading ? 'Submit' : 'Loading...'}
          disabled={!cardValid || loading}
          wide
        />
      </CheckoutForm>
      <Footer>
        {`Card token: ${cardToken}`}
      </Footer>
    </>
  );
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const Field = styled.label`
  display: block;
  margin-top: 15px;
  cursor: pointer;
  span {
    display: block;
    margin-bottom: 8px;
  }
  #wallet {
    color: ${Secondary500};
    letter-spacing: 0;
    padding: 12px 16px;
    font-size: 12px;
    line-height: 14px;
    background: ${AdditionalLight};
    border: 1px solid ${BlueGrey500};
    border-radius: 4px;
    width: calc(100% - 32px);
  }
  #wallet:focus {
    border: 1px solid ${Primary500};
    outline: none;
  }
`;

const DateCodeRow = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
`;

const DateCodeField = styled(Field)`
  width: 200px;
`;

const Footer = styled.div`
  margin-top: 20px;
`;

const Error = styled.span`
  position: absolute;
  color: ${Coral700};
  font-size: 11px;
`;

export default CheckoutModal;
