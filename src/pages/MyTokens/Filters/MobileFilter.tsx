import React, { ReactElement, useCallback, useState } from 'react';
import styled from 'styled-components/macro';
import { Button, Select, Tabs } from 'components/UI';
import { IconProps } from '@unique-nft/ui-kit';
import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';

import { AdditionalLight } from 'styles/colors';
import { FilterChangeHandler, MyTokensFilterState } from './types';

type MobileFiltersProps<T> = {
  filterCount: number
  defaultSortingValue: SelectOptionProps
  sortingValue: string
  sortingOptions: {
    id: string | number
    title: string | number
    iconRight?: IconProps
  }[]
  onFilterChange: FilterChangeHandler<T>
  onSortingChange(value: SelectOptionProps): void
  filterComponent?: ReactElement | null
  testid: string
}

const tabs = ['Filter', 'Sort'];

export function MobileFilters<T = MyTokensFilterState>({ filterCount, filterComponent, defaultSortingValue, sortingValue, sortingOptions, onFilterChange, onSortingChange, testid }: MobileFiltersProps<T>) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const onVisibleButtonClick = useCallback(() => {
    setIsVisible(true);
  }, [setIsVisible]);

  const onShowButtonClick = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const onResetButtonClick = useCallback(() => {
    setIsVisible(false);
    onFilterChange(null);
    onSortingChange(defaultSortingValue);
  }, [setIsVisible]);

  return <>
    <MobileFilterActionsWrapper>
      {!isVisible && <Button role={'primary'} onClick={onVisibleButtonClick} title={`Filter and sort ${filterCount ? `(${filterCount})` : ''} `} />}
      {isVisible && <>
        <Button onClick={onShowButtonClick} title={'Show'} />
        <Button role={'danger'} onClick={onResetButtonClick} title={'Reset'} />
      </>
      }
    </MobileFilterActionsWrapper>
    <MobileFilterModal isVisible={isVisible}>
      <Tabs
        activeIndex={activeTabIndex}
        labels={tabs}
        onClick={setActiveTabIndex}
      />
      <Tabs
        activeIndex={activeTabIndex}
      >
        {filterComponent || <></>}
        <SortStyled>
          <Select
            onChange={onSortingChange}
            options={sortingOptions}
            value={sortingValue}
          />
        </SortStyled>
      </Tabs>
    </MobileFilterModal>
  </>;
}

const MobileFilterActionsWrapper = styled.div`
  display: none;
  position: fixed;
  top: calc(100vh - 60px);    
  right: 0;
  left: 0;
  padding: 10px calc(var(--gap) * 1.5);
  background-color: ${AdditionalLight};
  box-shadow: 0px -8px 12px rgba(0, 0, 0, 0.06);
  z-index: 8;
  column-gap: calc(var(--gap) / 2);
  
  @media (max-width: 1024px) {
    display: flex;
  }

  @media (max-width: 567px) {
    button {
      flex-grow: 1;
    }
  }
`;

const MobileFilterModal = styled.div<{ isVisible: boolean }>`
  display: none;
  position: fixed;
  background-color: ${AdditionalLight};
  padding: calc(var(--gap) * 1.5);
  height: calc(100vh - 140px);
  top: 80px;
  right: 0;
  left: 0;
  overflow-y: auto;

  & div[class^=Filters] {
    width: 100%;
    padding-bottom: 60px;
  }
  
  & div[class^=CollectionsFilter__CollectionFilterWrapper] {
    max-height: unset;
    div[class^=CollectionsFilter__AttributeWrapper]:last-child {
      padding-bottom: 90px;
    }
  }
  
  @media (max-width: 1024px) {
    display: ${({ isVisible }) => isVisible ? 'block' : 'none'};
  }
`;

const SortStyled = styled.div`
  width: 235px;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
`;
