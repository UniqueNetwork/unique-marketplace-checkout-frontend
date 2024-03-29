import { useCallback, useMemo, useState } from 'react';

import { compareEncodedAddresses } from 'api/uniqueSdk/utils/addressUtils';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { LoginPayload, LoginResponse } from './types';
import { JWTDecode } from 'utils/JWTDecode';
import { post } from '../base';
import { defaultParams } from '../base/axios';

export const JWTokenLocalStorageKey = 'unique_market_jwt';

const endpoint = '/api/admin/login';

const logInMessage = '/api/admin/login';

export const adminLogIn = (body: LoginPayload, signature: string) => post<any, LoginResponse>(`${endpoint}`, null, { headers: { ...defaultParams.headers, Authorization: `Bearer ${signature}` }, params: body, ...defaultParams });

export const useAdminLoggingIn = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { selectedAccount, signMessage } = useAccounts();
  const { settings } = useApi();

  const hasAdminPermission: boolean = useMemo(() => {
    if (!selectedAccount) return false;
    return settings?.administrators.some((address) => compareEncodedAddresses(address, selectedAccount.address)) || false;
  }, [selectedAccount?.address, settings?.administrators]);

  const logIn = useCallback(async () => {
    if (!selectedAccount?.address) return null;
    setIsLoggingIn(true);
    let signature;
    try {
      signature = await signMessage(logInMessage);
      const response = await adminLogIn({
        account: selectedAccount.address
      }, signature);

      setIsLoggingIn(false);
      if (response.status === 200) {
        localStorage.setItem(JWTokenLocalStorageKey, response.data.accessToken);
        return response.data.accessToken;
      }
    } catch (e) {
      setIsLoggingIn(false);
      console.error('Administrator authorization failed', e);
    }
    return null;
  }, [selectedAccount, signMessage]);

  const getJWToken = useCallback(async () => {
    if (!selectedAccount?.address) return null;
    const jwToken = localStorage.getItem(JWTokenLocalStorageKey);

    if (!jwToken) return await logIn();

    // Check time of JWToken is expired
    const { exp } = JWTDecode(jwToken);
    if (exp * 1000 <= Date.now()) {
      // TODO: refresh token
      logOut();
      return logIn();
    }

    return jwToken;
  }, [logIn]);

  const logOut = useCallback(() => {
    localStorage.removeItem(JWTokenLocalStorageKey);
  }, []);

  return {
    isLoggingIn,
    hasAdminPermission,
    logIn,
    getJWToken,
    logOut
  };
};
