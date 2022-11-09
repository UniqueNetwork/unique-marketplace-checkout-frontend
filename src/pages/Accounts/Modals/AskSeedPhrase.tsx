import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from 'react';
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';
import { Button, Checkbox, Select, Text, useNotifications } from 'components/UI';
import { Heading, Link } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { TCreateAccountBodyModalProps } from './types';
import { addressFromSeed } from '../../../utils/seedUtils';

import DefaultAvatar from 'static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import { Coral700, Primary500 } from 'styles/colors';
import { Avatar } from 'components/Avatar/Avatar';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import { IconButton } from 'components/IconButton/IconButton';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { Icon } from 'components/Icon/Icon';

type TOption = SelectOptionProps & { id: string, title: string };

const seedGenerators: TOption[] = [
  { id: 'Mnemonic', title: 'Mnemonic' }
];

export const AskSeedPhraseModal: FC<TCreateAccountBodyModalProps> = ({ onFinish, testid }) => {
  const [seed, setSeed] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [confirmSeedSaved, setConfirmSeedSaved] = useState<boolean>(false);
  const [seedGenerator, setSeedGenerator] = useState('Mnemonic');
  const [seedValid, setSeedValid] = useState(true);
  const deviceSize = useDeviceSize();
  const { info } = useNotifications();
  const seedInputRef = useRef<HTMLTextAreaElement>(null);

  const changeSeed = useCallback((value: string) => {
    setSeed(value);
    setSeedValid(mnemonicValidate(value));
    if (mnemonicValidate(value)) {
      const newAddress = addressFromSeed(value, derivePath, defaultPairType);
      setAddress(newAddress);
    } else {
      setAddress('');
    }
  }, [setSeed]);

  const generateSeed = useCallback(() => {
    const seed = mnemonicGenerate();
    changeSeed(seed);
  }, [setSeed]);

  const onSeedGeneratorChange = useCallback((value: TOption) => {
    setSeedGenerator(value.id);
  }, []);

  const onSeedChange = useCallback(({ target }: ChangeEvent<HTMLTextAreaElement>) => {
    changeSeed(target.value);
  }, []);

  useEffect(() => {
    generateSeed();
  }, []);

  const onNextClick = useCallback(() => {
    if (!address || !confirmSeedSaved || !seedValid) return;
    onFinish({ seed, address });
  }, [seed, address, confirmSeedSaved, onFinish]);

  const onCopySeedClick = useCallback(() => {
    if (!navigator.clipboard) {
      seedInputRef.current?.select();
      document.execCommand('copy');
      info(
        'Seed copied',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
      return;
    }
    navigator.clipboard.writeText(seed).then(() => {
      info(
        'Seed copied',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  }, [seed]);

  return (<>
    <AddressWrapper>
      {address && <Avatar size={24} src={DefaultAvatar} address={address} />}
      <Text
        testid={`${testid}-address`}
        color={'grey-500'}
      >{address}</Text>
    </AddressWrapper>
    <Heading size={'4'} >The secret seed value for this account</Heading>
    <SeedGeneratorSelectWrapper>
      <Select
        testid={`${testid}-seed-generator-select`}
        options={seedGenerators}
        value={seedGenerator}
        onChange={onSeedGeneratorChange}
        disabled={seedGenerators.length === 1}
      />
      <IconWithHint align={{ appearance: 'vertical', vertical: 'top', horizontal: 'middle' }}>
        <span>Find out more on <TooltipLink href='https://wiki.polkadot.network/docs/learn-accounts' target='_blank' title={'Polkadot Wiki'}>Polkadot Wiki</TooltipLink></span>
      </IconWithHint>
    </SeedGeneratorSelectWrapper>
    <InputSeedWrapper>
      <SeedInput
        data-testid={`${testid}-seed-input`}
        onChange={onSeedChange}
        value={seed}
        rows={deviceSize === DeviceSize.sm ? 4 : 2}
        ref={seedInputRef}
      />
      <IconButton
        testid={`${testid}-seed-reload`}
        size={24}
        name={'reload'}
        color={'var(--color-additional-dark)'}
        onClick={generateSeed}
      />
    </InputSeedWrapper>
    {!seedValid && <ErrorText>Seed phrase is invalid</ErrorText>}
    {deviceSize < DeviceSize.md && <CopySeedWrapper onClick={onCopySeedClick} >
      <Icon name='copy' color={Primary500} size={24} />
      <Text size='s' weight={'regular'} color={'primary-500'}>Copy seed phrase</Text>
    </CopySeedWrapper>}
    <WarningBlock>
      Ensure that you keep this seed in a safe place. Anyone with access to it can re-create the account and gain full access to it.
    </WarningBlock>
    <ConfirmWrapperRow>
      <Checkbox
        testid={`${testid}-saved-seed-checkbox`}
        label={'I have saved my mnemonic seed safely'}
        checked={confirmSeedSaved}
        onChange={setConfirmSeedSaved}
        size={'m'}
      />
    </ConfirmWrapperRow>
    <ButtonWrapper>
      <StepsTextStyled size={'m'}>Step 1/3</StepsTextStyled>
      <Button
        testid={`${testid}-next-button`}
        disabled={!address || !confirmSeedSaved || !seedValid}
        onClick={onNextClick}
        role='primary'
        title='Next'
      />
    </ButtonWrapper>
  </>);
};

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) * 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: 20px var(--gap);
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const SeedGeneratorSelectWrapper = styled.div`
  display: flex;
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: var(--gap);
  align-items: center;
  column-gap: 10px;
  .unique-select {
    flex-grow: 1;
  }
`;

const InputSeedWrapper = styled.div`
  display: flex;
  margin-bottom: var(--gap);
  align-items: flex-start;
`;

const CopySeedWrapper = styled.button`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  align-items: center;
  height: 24px;
  border: none;
  background: transparent;
`;

const SeedInput = styled.textarea`
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  width: 100%;
  height: auto;
  resize: none;
  outline: 0px none transparent;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-right: calc(var(--gap) / 2);
`;

const ConfirmWrapperRow = styled.div`
  display: flex;
  margin-bottom: calc(var(--gap) * 1.5);
`;

const StepsTextStyled = styled(Text)`
  flex-grow: 1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  @media (max-width: 568px) {
    flex-direction: column;
    align-items: flex-start;
    row-gap: calc(var(--gap) /2);
    button {
      width: 100%;
    }
  }
`;

const TooltipLink = styled(Link)`
  color: var(--color-additional-light);
  text-decoration: underline;
`;

const ErrorText = styled.p`
  color: ${Coral700};
  text-align: right;
  margin-top: calc(var(--gap) * (-0.5));
  margin-right: calc(var(--gap) * 2);
`;
