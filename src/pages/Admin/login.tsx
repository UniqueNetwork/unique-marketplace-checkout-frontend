import React, { FC, useEffect } from 'react';
import { Text, useNotifications } from 'components/UI';
import styled from 'styled-components/macro';

import { PagePaper } from '../../components/PagePaper/PagePaper';
import { useNavigate } from 'react-router-dom';
import { useAdminLoggingIn } from '../../api/restApi/admin/login';
import { useAccounts } from '../../hooks/useAccounts';

export const AdminLoginPage: FC = () => {
  const { isLoading: isAccountsLoading } = useAccounts();
  const { logIn } = useAdminLoggingIn();
  const navigate = useNavigate();
  const { warning } = useNotifications();

  useEffect(() => {
    if (isAccountsLoading) return;
    void (async () => {
      const jwtoken = await logIn();
      if (!jwtoken) {
        warning(
          'Unable to login, please try again!',
          { name: 'warning', size: 32, color: 'var(--color-additional-light)' }
        );
        navigate('/');
      } else {
        navigate('/administration');
      }
    })();
  }, [isAccountsLoading]);

  return (<PagePaper>
    <AuthorizationMessageWrapper>
      <Text>Need to authorize administrator: sign the message to get access</Text>
    </AuthorizationMessageWrapper>
  </PagePaper>);
};

const AuthorizationMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
