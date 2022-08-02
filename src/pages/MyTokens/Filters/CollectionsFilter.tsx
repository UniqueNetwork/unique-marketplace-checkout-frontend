import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Text } from '@unique-nft/ui-kit';
import { useCollections } from 'hooks/useCollections';
import { useApi } from 'hooks/useApi';
import Accordion from 'components/Accordion/Accordion';
import AttributeCountsFilter from 'components/Filters/AttributeCountsFilter';
import AttributesFilter from 'components/Filters/AttributesFilter';
import CheckboxSkeleton from 'components/Skeleton/CheckboxSkeleton';
import { AttributeItem } from 'components/Filters/types';
import { useAttributes } from 'api/restApi/offers/attributes';
import { useAttributeCounts } from 'api/restApi/offers/attributeCounts';
import { CollectionCover } from 'components/CollectionCover/CollectionCover';
import { Avatar } from '../../../components/Avatar/Avatar';
// import { AttributeItem } from './types';
import { NFTCollection, NFTToken } from 'api/uniqueSdk/types';
import { Attribute, AttributeCount } from 'api/restApi/offers/types';
import { getAttributesCountFromTokens, getAttributesFromTokens } from './utils/attributes';

interface CollectionsFilterProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
  tokens: NFTToken[]
  collections: NFTCollection[]
  isFetchingTokens: boolean
}

const CollectionsFilter: FC<CollectionsFilterProps> = ({
  value,
  onChange,
  onAttributesChange,
  onAttributeCountsChange,
  testid,
  tokens,
  collections: myCollections,
  isFetchingTokens
}) => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};
  const { settings } = useApi();

  useEffect(() => {
    console.log('tokens', tokens);
    console.log('setAttributeCounts');
    if (!isFetchingTokens && tokens.length > 0) {
      setAttributeCounts(getAttributesCountFromTokens(tokens));
    }
  }, [isFetchingTokens, tokens]);

  useEffect(() => {
    console.log('setAttributes');
    if (!isFetchingTokens && tokens.length > 0 && selectedCollections.length === 1) {
      setAttributes(getAttributesFromTokens(tokens));
    }
  }, [isFetchingTokens, tokens, selectedCollections.length]);

  console.log('attributeCounts', attributeCounts);
  console.log('attributes', attributes);

  // useEffect(() => {
  //   if (myCollections.length > 0 && !isAttributeCountsFetching) fetchAttributeCounts(myCollections.map((collection) => collection.id));
  // }, [myCollections]);
  //
  // useEffect(() => {
  //   if (selectedCollections.length === 1 && !isAttributesFetching) fetchAttributes(selectedCollections[0]);
  //   if (selectedCollections.length > 1) resetAttributes();
  // }, [selectedCollections]);
  // useEffect(() => {
  //   if (settings && settings.blockchain.unique.collectionIds.length > 0 && attributeCounts.length === 0) {
  //     fetchAttributeCounts(selectedCollections?.length ? selectedCollections : settings?.blockchain.unique.collectionIds || []);
  //   }
  // }, [settings?.blockchain.unique.collectionIds]);

  // const myAttributesCount = useMemo(() => {
  //   // count attributes in each token
  //   const countTokenAttributes = tokens.map((token) => {
  //     if (!token?.attributes) return 0;
  //     // let count = 0;
  //     // if (token?.attributes?.Traits) count = token?.attributes?.Traits.length
  //     // return token?.attributes?.Gender ? ++count : count;
  //     return 0;
  //   });
  //   // count tokens with the same amount of attributes, result be like { 7: 2, 6: 1 }
  //   const counterMap: any = {};
  //   countTokenAttributes.forEach((count) => {
  //     if (counterMap[count]) counterMap[count]++;
  //     else counterMap[count] = 1;
  //   });
  //   // convert to format [{ "numberOfAttributes": 7,"amount": 2 }, { "numberOfAttributes": 6,"amount": 1 }]
  //   const result: AttributeCount[] = [];
  //   for (const attributesCount of Object.keys(counterMap)) {
  //     result.push({ numberOfAttributes: Number(attributesCount), amount: counterMap[attributesCount] });
  //   }
  //   return result;
  // }, [tokens]);
  //
  // const myAttributes = useMemo<Record<string, Attribute[]>>(() => {
  //   if (selectedCollections.length === 1) {
  //     // get list of all attributes for all tokens
  //     const allAttributes: string[] = [];
  //     tokens.forEach((token) => {
  //       // if (token?.attributes?.Traits) {
  //       //   allAttributes = [...allAttributes, ...token.attributes.Traits];
  //       // }
  //     });
  //     // count every attribute
  //     const counterMap: any = {};
  //     allAttributes.forEach((attribute) => {
  //       if (counterMap[attribute]) counterMap[attribute]++;
  //       else counterMap[attribute] = 1;
  //     });
  //     const result: Attribute[] = [];
  //     for (const attribute of Object.keys(counterMap)) {
  //       result.push({ key: attribute, count: counterMap[attribute] });
  //     }
  //     return { Traits: result };
  //   }
  //   return { Traits: [] };
  // }, [tokens, selectedCollections]);

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

    // const _attributeCounts = await fetchAttributeCounts(_selectedCollections.length > 0 ? _selectedCollections : settings?.blockchain.unique.collectionIds || []);
    // const _selectedAttributeCounts = selectedAttributeCounts.filter((item) => _attributeCounts.findIndex(({ numberOfAttributes }) => numberOfAttributes === item) > -1);
    //
    // // since attributes are shown only if one collection is selected -> we should always reset them
    // onChange(_selectedCollections, [], _selectedAttributeCounts);
  }, [selectedCollections, selectedAttributeCounts, onAttributesChange, onChange, settings?.blockchain.unique.collectionIds]);

  const onCollectionsClear = useCallback(() => {
    onChange([], [], []);
    // onChange([]);
    // fetchAttributeCounts(settings?.blockchain.unique.collectionIds || []);
  }, [onChange]);

  // console.log('attributeCounts filter', attributeCounts);

  return (<>
    <Accordion title={'Collections'}
      isOpen={true}
      onClear={onCollectionsClear}
      isClearShow={selectedCollections.length > 0}
      testid={`${testid}-accordion`}
    >
      <CollectionFilterWrapper>
        {isFetchingTokens && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        {!isFetchingTokens && myCollections.map((collection) => (
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
    {(!isFetchingTokens && !!attributeCounts.length) && <AttributeCountsFilter
      attributeCounts={attributeCounts}
      selectedAttributeCounts={selectedAttributeCounts}
      onAttributeCountsChange={onAttributeCountsChange}
      isAttributeCountsFetching={isFetchingTokens}
      testid={`${testid}-attribute-count`}
    />}
    {(onAttributesChange && selectedCollections.length === 1) && <AttributesFilter
      attributes={attributes}
      selectedAttributes={selectedAttributes}
      onAttributesChange={onAttributesChange}
      isAttributesFetching={isFetchingTokens}
      testid={`${testid}-attributes`}
    />}
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
