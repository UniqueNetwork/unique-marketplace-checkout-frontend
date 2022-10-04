import React, { FC, useCallback, useRef, useState } from 'react';
import questionIcon from 'static/icons/question.svg';
import styled from 'styled-components';
import { Tooltip, TooltipAlign } from '@unique-nft/ui-kit';
import { Primary500 } from 'styles/colors';

interface IProps {
  align?: TooltipAlign;
}

const IconWithHint: FC<IProps> = ({ align, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const targetRef = useRef<any>(null);
  const onHover = useCallback(
    () => {
      setIsHovered(true);
    },
    []
  );
  const onHoverEnd = useCallback(
    () => {
      setIsHovered(false);
    },
    []
  );
  return (
    <Cell>
      <IconContainer
        onMouseOver={onHover}
        onMouseOut={onHoverEnd}
      >
        <Tooltip
          align={align}
          targetRef={targetRef}
        >
          {children}
        </Tooltip>
        <svg
          className={'icon icon-question'}
          fill={Primary500}
          width={24}
          height={24}
          data-testid={'icon-question'}
          ref={targetRef}
        >
          <use href={`${questionIcon}#question${isHovered ? '-filled' : ''}`} xlinkHref={`${questionIcon}#question${isHovered ? '-filled' : ''}`} />
        </svg>
      </IconContainer>
    </Cell>
  );
};

const Cell = styled.div`
  display: flex;
  align-items: center;
`;

const IconContainer = styled.div`
  position: relative;
  svg { cursor: pointer; }
`;

export default IconWithHint;
