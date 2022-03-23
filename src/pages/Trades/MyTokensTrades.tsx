import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, InputText, Pagination } from '@unique-nft/ui-kit';
import { SortQuery } from '@unique-nft/ui-kit/dist/cjs/types';

import { useTrades } from '../../api/restApi/trades/trades';
import styled from 'styled-components';
import { Table } from '../../components/Table';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { tradesColumns } from './columns';
import { useAccounts } from '../../hooks/useAccounts';
import { useGetTokensByTrades } from './hooks/useGetTokensByTrades';

const pageSize = 20;

export const MyTokensTradesPage: FC = () => {
  const { selectedAccount } = useAccounts();
  const [page, setPage] = useState<number>(0);
  const [sortString, setSortString] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string | number>();

  const { trades, tradesCount, fetch, isFetching } = useTrades();
  const { tradesWithTokens, isFetchingTokens } = useGetTokensByTrades(trades);

  useEffect(() => {
    if (!selectedAccount?.address) return;
    fetch({ page: 1, pageSize, sortString, seller: selectedAccount?.address });
  }, [selectedAccount?.address, fetch]);

  const onSearch = useCallback(() => {
    // TODO: not implemented in api
    // fetch({ sortString, pageSize, page: 1, searchText: searchValue?.toString() });
  }, [sortString, pageSize, searchValue]);

  const onPageChange = useCallback((newPage: number) => {
    if (!selectedAccount?.address || page === newPage) return;
    setPage(newPage);
    fetch({ page: newPage + 1, pageSize, sortString });
  }, [selectedAccount?.address, page, fetch, sortString]);

  const onSortChange = useCallback((newSort: SortQuery) => {
    let sortString = '';
    switch (newSort.mode) {
      case 0:
        sortString = 'asc';
        break;
      case 1:
        sortString = 'desc';
        break;
      case 2:
      default:
        sortString = '';
        break;
    }
    if (sortString?.length) sortString += `(${newSort.field})`;
    setSortString(sortString);
    fetch({ page: 1, pageSize, sortString });
  }, [fetch, setSortString]);

  return (<PagePaper>
    <TradesPageWrapper>
      <SearchWrapper>
        <InputText
          iconLeft={{ name: 'magnify', size: 16 }}
          onChange={(val) => setSearchValue(val)}
          placeholder='Collection / token'
          value={searchValue?.toString()}
        />
        <Button
          onClick={onSearch}
          role='primary'
          title='Search'
        />
      </SearchWrapper>
      <Table
        onSort={onSortChange}
        data={tradesWithTokens || []}
        columns={tradesColumns}
        loading={isFetching || isFetchingTokens}
      />
      {!!tradesCount && <PaginationWrapper>
        <Pagination
          size={tradesCount}
          current={page}
          perPage={pageSize}
          onPageChange={onPageChange}
          withIcons
        />
      </PaginationWrapper>}
    </TradesPageWrapper>
  </PagePaper>);
};

const TradesPageWrapper = styled.div`
  width: 100%
`;

const SearchWrapper = styled.div`
  display: flex;
  margin-bottom: calc(var(--gap) * 2);
  button {
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    width: 100%;
    .unique-input-text {
      flex-grow: 1;
    }
  }

  @media (max-width: 320px) {
    .unique-button {
      display: none;
    }
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: calc(var(--gap) * 2);
`;
