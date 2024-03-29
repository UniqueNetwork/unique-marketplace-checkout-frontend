import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AdditionalLight, Grey500, Primary100, Primary500 } from '../../../../styles/colors';
import { Icon } from 'components/Icon/Icon';

export interface DropdownSelectProps<T> {
  className?: string
  placeholder?: string
  options: T[]
  value?: T
  onChange(value: T): void
  renderOption?(value: T): ReactNode | string
}

export function DropdownSelect<T>({ className, placeholder, options, value, onChange, renderOption }: DropdownSelectProps<T>) {
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const InputRef = useRef<HTMLDivElement>(null);
  const DropdownRef = useRef<HTMLDivElement>(null);

  const onClick = useCallback(() => {
    setIsDropdownVisible(!isDropdownVisible);
  }, [isDropdownVisible, setIsDropdownVisible]);

  const onOptionClick = useCallback((option: T) => () => {
    setIsDropdownVisible(false);
    onChange(option);
  }, [onChange]);

  const showOption = useCallback((option: T) => {
    if (renderOption) return renderOption(option);
    if (Object.hasOwnProperty.call(option, 'title')) return (option as unknown as { title: string }).title;
    if (typeof option === 'string' || typeof option === 'number') return option;

    return null;
  }, [renderOption]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (DropdownRef.current && InputRef.current &&
        !InputRef.current.contains(event.target as Node) &&
        !DropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  return (<SelectInputWrapper>
    <InputWrapper className={className} onClick={onClick} ref={InputRef}>
      {!value && placeholder && <Placeholder>{placeholder}</Placeholder>}
      {value && showOption(value)}
      {options.length > 0 && <Icon name={'triangle'} size={8} />}
    </InputWrapper>
    <Dropdown isOpen={isDropdownVisible} ref={DropdownRef}>
      {options.map((item, index) => (
        <OptionWrapper key={index} onClick={onOptionClick(item)} >{showOption(item)}</OptionWrapper>
      ))}
    </Dropdown>
  </SelectInputWrapper>);
}

const SelectInputWrapper = styled.div`
  position: relative;
`;

const InputWrapper = styled.div`
  box-sizing: border-box;
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  position: relative;
  min-height: 36px;
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
  input {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: none;
    background: transparent;
    width: 100%;
    outline: none;
    padding: var(--gap);
  }
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  position: absolute;
  min-width: 100%;
  top: calc(100% + 4px);
  flex-direction: column;
  background: ${AdditionalLight};
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  max-height: 50vh;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10;
  @media (max-width: 768px) {
    right: 0;
    max-width: calc(100vw - var(--gap) * 2);
  }
`;

const OptionWrapper = styled.div`
  padding: var(--gap);
  cursor: pointer;
  &:hover {
    background: ${Primary100};
    color: ${Primary500};
  }
`;

const Placeholder = styled.div`
  color: ${Grey500};
`;
