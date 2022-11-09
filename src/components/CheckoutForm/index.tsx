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
  onFormActive: () => void
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
      background: '#FFFFFF',
      borderRadius: '4px',
      padding: '8px 16px',
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: 24,
      border: '1px solid #D2D3D6',
      fontFamily: 'Inter, sans-serif'
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
  children,
  onFormActive
}) => {
  useEffect(() => {
    window.Frames.addEventHandler(window.Frames.Events.READY, () => {
      setTimeout(onFormActive, 500);
    });
    return () => {
      window.Frames.removeAllEventHandlers(window.Frames.Events.READY);
    };
  }, []);

  useEffect(() => {
    window.Frames.init({
      publicKey,
      debug,
      namespace,
      localization,
      style,
      modes: [window.Frames.modes.DISABLE_COPY_PASTE]
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
      window.Frames.removeAllEventHandlers(window.Frames.Events.FRAME_ACTIVATED);
    };
  }, [onCardValidationChanged, onCardSubmitted, onCardTokenized, paymentMethodChanged, onValidationChanged, onCardTokenizationFailed]);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    window.Frames.submitCard();
  }, []);

  return (
    <form
      id={'payment-form'}
      onSubmit={onSubmit}
      className={className}
    >
      {children}

    </form>
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

const StyledFrame = styled.div`
  height: 40px;
  margin-top: 16px;
`;

export * from '../../types/CheckoutTypes';
export default CheckoutForm;
