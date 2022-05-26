import React, { FC, FormEvent, useCallback, useEffect } from 'react';
import { FramesInitProps, FramesObject, ValidationChangeEvent } from '../../types/CheckoutTypes';
import styled from 'styled-components/macro';

declare global {
  interface Window {
    Frames: FramesObject;
  }
}

interface CheckoutFormProps extends FramesInitProps {
  onCardSubmitted?: () => void;
  onCardValidationChanged?: (isValid: boolean) => void;
  onCardTokenized?: (token: string) => void;
  onCardTokenizationFailed?: () => void;
  paymentMethodChanged?: (paymentMethod: string) => void;
  onValidationChanged?: (event: ValidationChangeEvent) => void;
  className?: string;
}

const CheckoutForm: FC<CheckoutFormProps> = ({
  publicKey,
  debug = false,
  namespace = 'Frames',
  localization = 'EN-GB',
  style = {
    base: {
      color: '#040B1D',
      letterSpacing: 0,
      padding: '12px 16px',
      fontSize: '12px',
      lineHeight: '18px',
      background: '#fafafa',
      border: '1px solid #7F90A1',
      borderRadius: '4px'
    },
    focus: {
      borderColor: '#009CF0'
    },
    invalid: {
      color: '#F73800',
      borderColor: '#F73800'
    }
  },
  onCardValidationChanged,
  onCardSubmitted,
  onCardTokenized,
  onCardTokenizationFailed,
  paymentMethodChanged,
  onValidationChanged,
  className,
  children
}) => {
  useEffect(() => {
    window.Frames.init({
      publicKey,
      debug,
      namespace,
      localization,
      style
    });

    if (onCardValidationChanged) {
      window.Frames.addEventHandler(window.Frames.Events.CARD_VALIDATION_CHANGED, (event) => {
        onCardValidationChanged(event.isValid);
      });
    }

    if (onCardSubmitted) {
      window.Frames.addEventHandler(window.Frames.Events.CARD_SUBMITTED, () => {
        onCardSubmitted();

        // Re-enables form after submit (helpful when submitting failed)
        setTimeout(() => window.Frames.enableSubmitForm(), 300);
      });
    }

    if (onCardTokenized) {
      window.Frames.addEventHandler(window.Frames.Events.CARD_TOKENIZED, (event) => {
        onCardTokenized(event.token);
      });
    }

    if (paymentMethodChanged) {
      window.Frames.addEventHandler(window.Frames.Events.PAYMENT_METHOD_CHANGED, (event) => {
        paymentMethodChanged(event.paymentMethod);
      });
    }

    if (onValidationChanged) {
      window.Frames.addEventHandler(window.Frames.Events.FRAME_VALIDATION_CHANGED, (event) => {
        onValidationChanged(event);
      });
    }

    if (onCardTokenizationFailed) {
      window.Frames.addEventHandler(window.Frames.Events.CARD_TOKENIZATION_FAILED, () => {
        onCardTokenizationFailed();
      });
    }

    return () => {
      window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_VALIDATION_CHANGED);
      window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_SUBMITTED);
      window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_TOKENIZED);
      window.Frames.removeAllEventHandlers(window.Frames.Events.CARD_TOKENIZATION_FAILED);
      window.Frames.removeAllEventHandlers(window.Frames.Events.FRAME_VALIDATION_CHANGED);
      window.Frames.removeAllEventHandlers(window.Frames.Events.PAYMENT_METHOD_CHANGED);
    };
  }, []);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    window.Frames.submitCard();
  }, []);

    return (
      <FormStyled
        id={'payment-form'}
        onSubmit={onSubmit}
        className={className}
      >
        {children}
      </FormStyled>
    );
};

export const CardNumberFrame: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <StyledFrame
    className={`card-number-frame ${className || ''}`.trim()}
    {...props}
  />
);

export const ExpiryDateFrame: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <StyledFrame
    className={`expiry-date-frame ${className || ''}`.trim()}
    {...props}
  />
);

export const CVVFrame: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
 className,
 ...props
}) => (
  <StyledFrame
    className={`cvv-frame ${className || ''}`.trim()}
    {...props}
  />
);

const FormStyled = styled.form`
  width: 300px;
  margin: 0 auto;
`;

const StyledFrame = styled.div`
  height: 40px;
`;

export * from '../../types/CheckoutTypes';
export default CheckoutForm;
