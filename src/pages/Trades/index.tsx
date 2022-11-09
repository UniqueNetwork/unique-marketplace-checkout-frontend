import React, { useCallback, useState } from 'react';
import { Tabs } from 'components/UI';
import { TokensTradesPage } from './TokensTrades';
import { useAccounts } from '../../hooks/useAccounts';

const testid = 'trades-page';

export const TradesPage = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { selectedAccount } = useAccounts();

  const handleClick = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex);
  }, [setActiveTab]);

  return (<>
    <Tabs
      testid={`${testid}-tabs`}
      activeIndex={activeTab}
      labels={['All tokens', 'My tokens']}
      onClick={handleClick}
      disabledIndexes={!selectedAccount ? [1] : []}
    />
    <TokensTradesPage currentTab={activeTab} testid={`${testid}-${activeTab ? 'myTokens' : 'allTokens'}`} />
  </>);
};
