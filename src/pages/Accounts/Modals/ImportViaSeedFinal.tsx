import React, { FC, useCallback, useMemo } from 'react';
import { Button, Text } from 'components/UI';
import styled from 'styled-components';

import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { defaultPairType, derivePath } from './CreateAccount';
import { TCreateAccountBodyModalProps } from './types';
import { Grey300 } from '../../../styles/colors';
import { Avatar } from 'components/Avatar/Avatar';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import { shortcutText } from '../../../utils/textUtils';

export const ImportViaSeedFinalModal: FC<TCreateAccountBodyModalProps> = ({ accountProperties, onFinish, onGoBack, testid }) => {
  const deviceSize = useDeviceSize();
  const onSaveClick = useCallback(() => {
    if (!accountProperties) return;
    onFinish(accountProperties);
  }, [accountProperties]);

  const formatAddress = useMemo(() => {
    if (!accountProperties?.address) return '';
    return deviceSize === DeviceSize.sm ? shortcutText(accountProperties.address) : accountProperties.address;
  }, [accountProperties, deviceSize]);

  return (<>
    <AddressWrapper>
      <Avatar size={24} src={DefaultAvatar} address={accountProperties?.address} />
      <Text testid={`${testid}-address`} color={'grey-500'}>{formatAddress}</Text>
    </AddressWrapper>
    <CredentialsWrapper >
      <LabelTextWrapper>
        <Text size={'m'}>Partial seed</Text>
        <IconWithHint>
          <>The seed is your key to the account. Knowing the seed allows you, or anyone else who knows the seed, to re-generate and control this account.</>
        </IconWithHint>
      </LabelTextWrapper>
      <ValueTextStyled>{accountProperties?.seed}</ValueTextStyled>
      <LabelTextWrapper>
        <Text size={'m'}>Keypair type</Text>
        <IconWithHint>
          <>Substrate supports a number of different crypto mechanisms. As such the keyring allows for the creation and management of different types of crypto.</>
        </IconWithHint>
      </LabelTextWrapper>
      <ValueTextStyled>{defaultPairType}</ValueTextStyled>
      <LabelTextWrapper>
        <Text size={'m'}>Derivation path</Text>
        <IconWithHint>
          <>If you would like to create and manage several accounts on the network using the same seed, you can use derivation paths.</>
        </IconWithHint>
      </LabelTextWrapper>
      <ValueTextStyled>{derivePath || 'None provided'}</ValueTextStyled>
    </CredentialsWrapper>
    <WarningBlock >
      Consider storing your account in a signer such as a browser extension, hardware device, QR-capable phone wallet (non-connected) or desktop application for optimal account security. Future versions of the web-only interface will drop support for non-external accounts, much like the IPFS version.
    </WarningBlock>
    <ButtonWrapper>
      <StepsTextStyled size={'m'}>Step 3/3</StepsTextStyled>
      <Button
        testid={`${testid}-previous-button`}
        onClick={onGoBack}
        title='Previous'
      />
      <Button
        testid={`${testid}-create-button`}
        onClick={onSaveClick}
        role='primary'
        title='Create account'
      />
    </ButtonWrapper>
  </>);
};

const AddressWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  margin-top: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) / 2);
  border: 1px solid var(--grey-300);
  border-radius: 4px;
  padding: 20px var(--gap);
  .unique-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const StepsTextStyled = styled(Text)`
  flex-grow: 1;
`;

const LabelTextWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  margin-top: calc(var(--gap) * 2);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: var(--gap);
  margin-top: calc(var(--gap) * 2);
  @media (max-width: 568px) {
    flex-direction: column;
    align-items: flex-start;
    row-gap: var(--gap);
    button {
      width: 100%;
    }
  }
`;

const CredentialsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  margin-bottom: calc(var(--gap) * 2);
  .unique-input-text {
    width: 100%;
  }
`;

const ValueTextStyled = styled.div`
  border: 1px solid ${Grey300};
  padding: 11px 12px;
  border-radius: 4px;
  background-color: var(--color-grey-100);
  color: var(--color-grey-500);
`;
