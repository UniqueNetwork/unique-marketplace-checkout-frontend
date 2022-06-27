import React, { FC } from 'react';
import styled from 'styled-components/macro';
import { AdditionalWarning100, AdditionalWarning500 } from '../../styles/colors';

const Warning: FC = ({ children }) => {
  return (
    <Message>{children}</Message>
  );
};

const Message = styled.p`
  padding: 9px 16px;
  background: ${AdditionalWarning100};
  border-radius: 4px;
  color: ${AdditionalWarning500};
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
`;

export default Warning;
