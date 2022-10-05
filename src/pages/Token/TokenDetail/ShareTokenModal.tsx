import React, { useCallback } from 'react';
import { Heading, Modal, useNotifications } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Primary500, Primary600 } from 'styles/colors';
import { TelegramShareButton, TwitterShareButton, FacebookShareButton, RedditShareButton } from 'components/ShareButton';
import { Icon } from '../../../components/Icon/Icon';

interface IShareTokenModalProps {
  isVisible: boolean;
  onClose(): void;
  testid: string;
}

const ShareTokenModal = ({ isVisible, onClose, testid }: IShareTokenModalProps) => {
  const { info } = useNotifications();

  const copyUrl = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      info(
        <div data-testid={`${testid}-link-copy-success-notification`}>Link copied</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  }, [info]);

  return (
    <Modal isVisible={isVisible} onClose={onClose} isClosable >
      <HeadingWrapper>
        <Heading size='2'>Share</Heading>
      </HeadingWrapper>
      <SocialButtonsWrapper>
        <TwitterShareButton url={window.location.href}>
          <Icon name={'social-twitter'} size={32} color={Primary500}/>
          <span>Twitter</span>
        </TwitterShareButton>
        <RedditShareButton url={window.location.href}>
          <Icon name={'social-reddit'} size={32} color={Primary500}/>
          <span>Reddit</span>
        </RedditShareButton>
        <TelegramShareButton url={window.location.href}>
          <Icon name={'social-telegram'} size={32} color={Primary500}/>
          <span>Telegram</span>
        </TelegramShareButton>
        <FacebookShareButton url={window.location.href}>
          <Icon name={'social-facebook'} size={32} color={Primary500}/>
          <span>Facebook</span>
        </FacebookShareButton>
      </SocialButtonsWrapper>
      <CopyBtnWrapper
        onClick={copyUrl}
      >
        <Icon name={'copy'} size={32} color={Primary500}/>
        <span>Copy link</span>
      </CopyBtnWrapper>
    </Modal>
  );
};

const HeadingWrapper = styled.div`
  margin-bottom: 24px;
`;

const SocialButtonsWrapper = styled.div`
  font-size: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 28px;
  button {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  button:hover span {
    color: ${Primary600};
  }
  @media (max-width: 567px) {
    button:first-of-type {
      margin-right: 18px;
    }
  }
`;

const CopyBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 120px;
  :hover span {
    color: ${Primary600};
  }
`;

export default ShareTokenModal;
