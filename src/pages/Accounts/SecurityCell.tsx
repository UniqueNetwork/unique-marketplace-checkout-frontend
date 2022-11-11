import React, { useCallback, useRef, useState } from 'react';
import { Tooltip } from '@unique-nft/ui-kit';
import { Primary500 } from 'styles/colors';
import styled from 'styled-components';
import { Icon } from 'components/UI';

export interface ISecurityCellProps {
  onClick(): void;
}

export const SecurityCell = ({ onClick }: ISecurityCellProps) => {
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

  return <IconContainer
    onMouseOver={onHover}
    onMouseOut={onHoverEnd}
    onClick={onClick}
  >
    <Tooltip
      align={{
        vertical: 'top',
        horizontal: 'middle',
        appearance: 'vertical'
      }}
      targetRef={targetRef}
    >
      {'View recovery phrase'}
    </Tooltip>
    <Icon
      name={'key'}
      color={isHovered ? Primary500 : '#000'}
      size={24}
      ref={targetRef}
    />
  </IconContainer>;
};

const IconContainer = styled.div`
  position: relative;
  svg { cursor: pointer; }
`;
