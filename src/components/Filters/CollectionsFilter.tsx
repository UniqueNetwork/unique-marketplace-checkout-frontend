import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import { Checkbox, Text } from 'components/UI';
import { useCollections } from '../../hooks/useCollections';
import Accordion from '../Accordion/Accordion';
import CheckboxSkeleton from '../Skeleton/CheckboxSkeleton';
import { AttributeItem } from './types';
import AttributesFilter from './AttributesFilter';
import AttributeCountsFilter from './AttributeCountsFilter';
import { Attribute, AttributeCount } from '../../api/restApi/offers/types';
import { CollectionCover } from '../CollectionCover/CollectionCover';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  attributes?: Record<string, Attribute[]>
  attributeCounts?: AttributeCount[]
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({ value, attributes, attributeCounts, onChange, onAttributesChange, onAttributeCountsChange, testid }) => {
  const { collections, isFetching } = useCollections();
  // const { attributes, fetch: fetchAttributes, reset: resetAttributes, isFetching: isAttributesFetching } = useAttributes();
  // const { attributeCounts, fetch: fetchAttributeCounts, isFetching: isAttributeCountsFetching } = useAttributeCounts();
  const { collections: selectedCollections = [] } = value || {};
  // const { settings } = useApi();

  // useEffect(() => {
  //   if (selectedCollections.length === 1 && !isAttributesFetching) fetchAttributes(selectedCollections[0]);
  // }, []);

  // useEffect(() => {
  //   if (settings && settings.blockchain.unique.collectionIds.length > 0 && attributeCounts.length === 0) {
  //     fetchAttributeCounts(selectedCollections?.length ? selectedCollections : settings?.blockchain.unique.collectionIds || []);
  //   }
  // }, [settings?.blockchain.unique.collectionIds]);

  const onCollectionSelect = useCallback((collectionId: number) => (value: boolean) => {
    let _selectedCollections;
    if (value) {
      _selectedCollections = [...selectedCollections, collectionId];
    } else {
      _selectedCollections = selectedCollections.filter((item) => item !== collectionId);
    }
    // since traits are shown only if one collection is selected -> we should always reset them
    onChange(_selectedCollections, [], []);

    // if (_selectedCollections.length === 1) fetchAttributes(_selectedCollections[0]);
    // else resetAttributes();

    // if (_selectedCollections.length > 0) fetchAttributeCounts(_selectedCollections);
    // else fetchAttributeCounts(settings?.blockchain.unique.collectionIds || []);
  }, [selectedCollections, onChange]);

  const onCollectionsClear = useCallback(() => {
    onChange([], [], []);
    // fetchAttributeCounts(settings?.blockchain.unique.collectionIds || []);
  }, [onChange]);

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
      testid={`${testid}-accordion`}
    >
      <CollectionFilterWrapper>
        {isFetching && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {collections.map((collection) => (
          <CheckboxWrapper
            key={`collection-${collection.id}`}
          >
            <Checkbox
              checked={selectedCollections.indexOf(collection.id) !== -1}
              label={''}
              size={'m'}
              onChange={onCollectionSelect(collection.id)}
              testid={`${testid}-checkbox-${collection.id}`}
            />
            <CollectionCover src={collection.coverImageUrl} size={22} type={'circle'}/>
            <Text
              testid={`${testid}-name-${collection.id}`}
            >{collection.collectionName || ''}</Text>
          </CheckboxWrapper>
          ))}
      </CollectionFilterWrapper>
    </Accordion>
    {/* {onAttributeCountsChange && attributeCounts.length > 0 && <AttributeCountsFilter */}
    {/*   attributeCounts={attributeCounts} */}
    {/*   selectedAttributeCounts={selectedAttributeCounts} */}
    {/*   isAttributeCountsFetching={isAttributeCountsFetching} */}
    {/*   onAttributeCountsChange={onAttributeCountsChange} */}
    {/* />} */}
    {/* {onAttributesChange && selectedCollections.length === 1 && <AttributesFilter */}
    {/*   attributes={attributes} */}
    {/*   selectedAttributes={selectedAttributes} */}
    {/*   isAttributesFetching={isAttributesFetching} */}
    {/*   onAttributesChange={onAttributesChange} */}
    {/* />} */}
  </>);
};

const CollectionFilterWrapper = styled.div`
  position: relative;
  margin-top: var(--gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  min-height: 50px;
  max-height: 400px;
  overflow-y: auto;
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  align-items: flex-start;
`;

export default CollectionsFilter;
