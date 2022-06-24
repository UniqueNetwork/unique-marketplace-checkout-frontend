// Copyright 2017-2022 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import React, { useCallback, useEffect, useRef } from 'react';

import { Modal } from '@unique-nft/ui-kit';
import config from '../../config';
import styled from 'styled-components';

interface Props {
  onClose: () => void;
}

function GetKSMModal ({ onClose }: Props): React.ReactElement<Props> {
  const ref = useRef<HTMLDivElement>(null);

  const handleGetKSMClickByRamp = useCallback(() => {
    const containerNode = ref.current ?? document.getElementById('root') as HTMLDivElement;

    const RampModal = new RampInstantSDK({
      containerNode,
      hostApiKey: config.rampApiKey,
      hostAppName: 'Unique Marketplace',
      hostLogoUrl: 'https://wallet.unique.network/logos/unique_logo.svg',
      swapAsset: 'KSM',
      variant: 'embedded-mobile'
    });

    RampModal
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .on('WIDGET_CLOSE', () => {
      onClose();
    })
    .show();
  }, [onClose]);

  useEffect(() => {
    handleGetKSMClickByRamp();
  }, [handleGetKSMClickByRamp]);

  return (
    <Modal
      isVisible
      isClosable
      onClose={onClose}
    >
      <Content ref={ref}>
      </Content>
    </Modal>
  );
}

const Content = styled.div`
  height: 720px;
  width: calc(640px - var(--prop-gap) * 3);
  @media (max-width: 640px) {
    width: calc(100vw - var(--prop-gap) * 2);
    height: 700px;
  }
  @media (width: 414px) { // for some reason RAMP has issues with touch handling on certain widths
    width: 362px;
  }
  @media (max-width: 420px) {
    height: 667px;
  }
`;

export default React.memo(GetKSMModal);
