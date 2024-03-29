import React, { FC, useCallback } from 'react';
import { InputText } from 'components/UI';
import styled from 'styled-components';
import { IconButton } from '../IconButton/IconButton';

interface AmountInputProps {
  value: string | undefined
  onChange(value: string): void
  placeholder?: string
  decimals?: number
  label?: string
  className?: string
  testid?: string
}

export const NumberInput: FC<AmountInputProps> = ({ value, onChange, placeholder, decimals = 6, label, className, testid = '' }) => {
  const onChangeInput = useCallback((_value: string) => {
    if (_value === '') onChange(_value);
    // regExp to check value according to valid number format
    const regExp = new RegExp(`^([1-9]\\d{0,4}|0)(\\.\\d{0,${decimals}})?$`);
    // check value is correct
    if (_value.length > 1 && _value.startsWith('0') && !_value.startsWith('0.')) _value = _value.replace('0', '');
    if (regExp.test(_value.trim())) {
      onChange(_value.trim());
    }
  }, [onChange, decimals]);

  const onClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return <InputWrapper className={className}>
    <InputText
      placeholder={placeholder}
      onChange={onChangeInput}
      value={value}
      label={label}
      testid={`${testid}`}
    />
    {value &&
      <ClearButton
        name={'circle-close'}
        size={16}
        onClick={onClear}
        testid={`${testid}-clear-button`}
    />}
  </InputWrapper>;
};

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
  .unique-input-text {
    width: auto;
    input {
      padding-right: 32px;
    }
  }
`;

const ClearButton = styled(IconButton)`
  position: absolute;
  right: calc(var(--gap) / 2);
  bottom: calc(var(--gap) / 2);
  width: auto !important;
`;
