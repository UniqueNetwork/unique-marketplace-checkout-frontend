import React, { FC, useCallback, useState } from 'react';
import { Picture } from '../Picture';
import { Icon } from '@unique-nft/ui-kit';
import { Secondary600 } from 'styles/colors';
import { VideoAttribute } from 'api/uniqueSdk/types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface ITokensMedia {
  to: string
  tokenId?: number
  imageUrl?: string
  video?: VideoAttribute
  testid: string
}

export const TokensMedia: FC<ITokensMedia> = ({ to, imageUrl, tokenId, video, testid }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <PictureWrapper to={to} isPlaying={isPlaying}>
      <Picture
        alt={tokenId?.toString() || ''}
        src={imageUrl}
        video={video}
        testid={`${testid}-token-picture`}
        videoProps={{ autoplay: false, controls: false }}
        isPlaying={isPlaying}
      />
      {video &&
        <div className={'play-button'} onClick={togglePlay}>
          <Icon name={'triangle'} size={16} color={Secondary600}/>
        </div>
      }
    </PictureWrapper>
  );
};

const PictureWrapper = styled(Link)<{ isPlaying: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }

  .picture {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    text-align: center;
    max-height: 100%;
    border-radius: 8px;
    transition: 50ms;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 100%;
    }

    svg {
      border-radius: 8px;
    }
  }
  
  .play-button {
    align-items: center;
    border-radius: 50%;
    display: flex;
    height: 44px;
    justify-content: center;
    bottom: 8px;
    right: 8px;
    width: 44px;
    z-index: 1;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    transform: rotate(270deg);
  }

  &:hover .picture {
    transform: ${({ isPlaying }) => (!isPlaying && 'translate(0, -5px)')};
    text-decoration: none;
  }
  
  &:hover .play-button {
    background-color: rgba(255, 255, 255, 0.8);
    opacity: 80%;
  }
`;
