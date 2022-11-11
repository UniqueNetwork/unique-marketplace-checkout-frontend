import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import { Button, Modal, Text, useNotifications } from 'components/UI';
import styled from 'styled-components';
import { PasswordInput } from 'components/PasswordInput/PasswordInput';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { AdditionalLight } from 'styles/colors';
import { useAccounts } from 'hooks/useAccounts';

export type TRecoveryMnemonicPhraseModalProps = {
  isVisible: boolean
  onClose(): void
  address?: string
}

export type TRecoveryMnemonicPhraseModalBodyProps = {
  onFinish(mnemonic?: string): void
  address?: string
  mnemonic?: string
}

enum RecoveryMnemonicPhraseModalStages {
  AskPassword,
  ShowSeed
}

export const RecoveryMnemonicPhraseModal: FC<TRecoveryMnemonicPhraseModalProps> = ({ isVisible, onClose, address }) => {
  const [stage, setStage] = useState<RecoveryMnemonicPhraseModalStages>(RecoveryMnemonicPhraseModalStages.AskPassword);
  const [mnemonic, setMnemonic] = useState<string>();

  const ModalBodyComponent = useMemo<FC<TRecoveryMnemonicPhraseModalBodyProps> | null>(() => {
    switch (stage) {
      case RecoveryMnemonicPhraseModalStages.AskPassword:
        return AskPasswordModalBody;
      case RecoveryMnemonicPhraseModalStages.ShowSeed:
        return ShowSeedModalBody;
      default:
        return null;
    }
  }, [stage]);

  const onStageFinish = useCallback((mnemonic: string) => {
    setMnemonic(mnemonic);
    setStage(RecoveryMnemonicPhraseModalStages.ShowSeed);
  }, [stage]);

  const onCloseModal = useCallback(() => {
    setStage(RecoveryMnemonicPhraseModalStages.AskPassword);
    onClose();
  }, [isVisible]);

  if (!ModalBodyComponent) return null;

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onCloseModal}>
    <ModalBodyComponent
      address={address}
      onFinish={onStageFinish}
      mnemonic={mnemonic}
    />
  </Modal>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const AskPasswordModalBody = ({ address, onFinish }: TRecoveryMnemonicPhraseModalBodyProps) => {
  const [password, setPassword] = useState<string>('');
  const [passwordIncorrect, setPasswordIncorrect] = useState<boolean>(false);
  const { restoreEncryptedMnemonic } = useAccounts();

  const onPasswordChange = useCallback((value: string) => {
    setPasswordIncorrect(false);
    setPassword(value);
  }, []);

  const onCheckPassword = useCallback(() => {
    if (!address) return;
    const mnemonic = restoreEncryptedMnemonic(address, password);
    if (!mnemonic) {
      setPasswordIncorrect(true);
      return;
    }
    onFinish(mnemonic);
  }, [onFinish, password, address]);

  return <>
    <Content>
      <Heading size='2'>Secret recovery phrase</Heading>
      <TextWrapper>
        <Text>Your recovery phrase gives you access to your wallet and funds. It can be used to restore your created accounts if you lose access to your device, or forget your password.</Text>
      </TextWrapper>
      <InputWrapper>
        <TitleWrapper>
          <Text size={'m'}>Password</Text>
        </TitleWrapper>
        <PasswordInput
          onChange={onPasswordChange}
          value={password}
        />
        {passwordIncorrect && <Text size={'s'} color={'coral-500'}>Password incorrect</Text>}
      </InputWrapper>
      <WarningBlock>Do not share this phrase with anyone! This phrase is all that is needed for full access to your assets tied to the account.</WarningBlock>
      <ButtonWrapper>
        <Button
          disabled={!password}
          onClick={onCheckPassword}
          role='primary'
          title='View recovery phrase'
        />
      </ButtonWrapper>
    </Content>
  </>;
};

const ShowSeedModalBody = ({ mnemonic }: TRecoveryMnemonicPhraseModalBodyProps) => {
  const { info } = useNotifications();
  const seedInputRef = useRef<HTMLTextAreaElement>(null);
  const deviceSize = useDeviceSize();

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
    navigator.clipboard.writeText(mnemonic || '').then(() => {
      info(
        'Seed copied',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  }, [mnemonic]);

  return <>
    <Content>
      <Heading size='2'>Your secret  recovery phrase</Heading>
      <SeedInput
        value={mnemonic}
        rows={deviceSize === DeviceSize.sm ? 4 : 2}
        ref={seedInputRef}
        disabled
      />
      <ButtonWrapper>
        <Button
          onClick={onCopySeedClick}
          role='primary'
          title='Copy to clipboard'
          iconLeft={{
            name: 'copy',
            size: 16,
            color: AdditionalLight
          }}
        />
      </ButtonWrapper>
    </Content>
  </>;
};

const TextWrapper = styled.div`
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) * 2);
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  
  .unique-upload {
    width: 100%;
    .upload.square, .preview.square {
      width: 100%;
    }
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: calc(var(--gap) * 2);
`;

const SeedInput = styled.textarea`
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: calc(var(--gap) / 2) var(--gap);
  width: calc(100% - var(--gap) * 2);
  height: auto;
  resize: none;
  outline: 0px none transparent;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-top: calc(var(--gap) * 1.5);
`;
