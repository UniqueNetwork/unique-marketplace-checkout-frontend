import React, { FC, useCallback, useEffect, useState } from 'react';
import { Pagination, SortQuery } from '@unique-nft/ui-kit';
import styled from 'styled-components';

import { useTrades } from '../../api/restApi/trades/trades';
import { Table } from '../../components/Table';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import getTradesColumns from './columns';
import { useAccounts } from '../../hooks/useAccounts';
import { TradesTabs } from './types';
import SearchField from '../../components/SearchField/SearchField';

import NoTradesIcon from '../../static/icons/no-trades.svg';
import useDeviceSize from '../../hooks/useDeviceSize';
import TokenTradesDetailsModal from './TradesDetailsModal';
import { Trade } from '../../api/restApi/trades/types';
import { debounce } from 'utils/helpers';

type TokensTradesPage = {
  currentTab: TradesTabs
  testid: string
}

export const TokensTradesPage: FC<TokensTradesPage> = ({ currentTab, testid }) => {
  const { selectedAccount, isLoading: isLoadingAccounts } = useAccounts();
  const [page, setPage] = useState<number>(0);
  const [sortString, setSortString] = useState<string>();
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>();
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<Trade | null>(null);
  const deviceSize = useDeviceSize();

  const { trades, tradesCount, fetch, isFetching } = useTrades();

  useEffect(() => {
    if (isLoadingAccounts || (currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address)) return;
    setSearchValue(undefined);
    setPage(0);
    fetch({
      page: 1,
      pageSize,
      sort: sortString,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [currentTab, selectedAccount?.address, isLoadingAccounts]);

  const debouncedSearch = useCallback(() => {
    return debounce(function (...args: string[]) {
      setSearchValue(args[0]);
      fetch({
        page: 1,
        pageSize,
        sort: sortString,
        searchText: args[0],
        seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
      });
    }, 300);
  }, [selectedAccount?.address, currentTab, sortString, pageSize]);

  const onPageChange = useCallback((newPage: number) => {
    if ((currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) || page === newPage) return;
    setPage(newPage);
    fetch({
      page: newPage + 1,
      pageSize,
      sort: sortString,
      searchText: searchValue,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, page, sortString, searchValue, pageSize]);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    if (currentTab === TradesTabs.MyTokensTrades && !selectedAccount?.address) return;
    setPageSize(newPageSize);
    setPage(0);
    fetch({
      page: 1,
      pageSize: newPageSize,
      sort: sortString,
      searchText: searchValue,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, page, sortString, searchValue]);

  const onSortChange = useCallback((newSort: SortQuery) => {
    let sortString;
    switch (newSort.mode) {
      case 2:
        sortString = 'asc';
        break;
      case 1:
        sortString = 'desc';
        break;
      case 0:
      default:
        sortString = undefined;
        break;
    }
    const associatedSortValues: Record<string, string> = {
      price: 'Price',
      tokenId: 'TokenId',
      tokenDescription: 'CollectionId',
      tradeDate: 'TradeDate',
      status: 'Status'
    };

    if (sortString && sortString.length) sortString += `(${associatedSortValues[newSort.field]})`;
    setSortString(sortString);
    fetch({
      page: 1,
      pageSize,
      sort: sortString,
      searchText: searchValue,
      seller: currentTab === TradesTabs.MyTokensTrades ? selectedAccount?.address : undefined
    });
  }, [selectedAccount?.address, currentTab, setSortString, pageSize, searchValue]);

  const onShowTradesDetailsModal = useCallback((trade: Trade) => {
    setSelectedOfferDetails(trade);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setSelectedOfferDetails(null);
  }, [setSelectedOfferDetails]);

  return (<PagePaper>
    <TradesPageWrapper>
      <StyledSearchField
        placeholder='NFT / collection'
        searchValue={searchValue}
        testid={`${testid}-search-field`}
        onSearch={debouncedSearch()}
        onSearchStringChange={debouncedSearch()}
      />
      <StyledTable
        onSort={onSortChange}
        data={trades || []}
        columns={getTradesColumns({ deviceSize, onShowTradesDetailsModal })}
        loading={isLoadingAccounts || isFetching}
        emptyIconProps={searchValue ? { name: 'magnifier-found' } : { file: NoTradesIcon }}
      />
      {!!tradesCount && <PaginationWrapper>
        <Pagination
          current={page}
          size={tradesCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          withPerPageSelector
          withIcons
        />
      </PaginationWrapper>}
      <TokenTradesDetailsModal trade={selectedOfferDetails} onCancel={closeDetailsModal}/>
    </TradesPageWrapper>
  </PagePaper>);
};

const TradesPageWrapper = styled.div`
  width: 100%;
  .unique-pagination-wrapper .per-page-selector-wrapper,
  .unique-select .select-wrapper {
    font-size: 16px;
  }

  @media (max-width: 640px) {
    .unique-modal-wrapper .unique-modal {
      width: calc(520px - var(--prop-gap) * 3);
    }
  }

  @media (max-width: 567px) {
    .unique-modal-wrapper .unique-modal {
      width: calc(288px - var(--prop-gap) * 3);
    }
  }
`;

const StyledSearchField = styled(SearchField)`
  margin-bottom: calc(var(--gap) * 2);
  @media (max-width: 567px) {
    button {
      display: none;
    }
  }
`;

const StyledTable = styled(Table)`
  && > div > div:first-child {
    & > .unique-text {
      display: none;
    }
  }
  @media (max-width: 567px) {
    & > div {
      grid-template-columns: 1fr !important;
    }
  }
`;

const PaginationWrapper = styled.div`
  margin-top: calc(var(--gap) * 2);
  
  .unique-pagination-wrapper {
    justify-content: space-between;
  }
  
  @media (max-width: 568px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
