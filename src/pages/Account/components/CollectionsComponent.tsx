import React, { FC, Reducer, useCallback, useEffect, useReducer, useState } from 'react'
import { useQuery } from '@apollo/client'
import { InputText, Checkbox, Icon, Button } from '@unique-nft/ui-kit'
import Avatar from '../../../components/Avatar'
import {
  Collection,
  collectionsQuery,
  Data as collectionsData,
  Variables as CollectionsVariables,
} from '../../../api/graphQL/collections'
import AccountLinkComponent from './AccountLinkComponent'
import CollectionCard from '../../../components/CollectionCard'

interface CollectionsComponentProps {
  accountId: string
}

type ActionType = 'All' | 'Owner' | 'Admin' | 'Sponsor' | 'Received'

const CollectionsComponent: FC<CollectionsComponentProps> = (props) => {
  const { accountId } = props

  const [filter, dispatchFilter] = useReducer<
    Reducer<Record<string, any> | undefined, { type: ActionType; value: string | boolean }>
  >((state, action) => {
    if (action.type === 'All' && action.value) {
      return undefined
    }
    if (action.type === 'Owner') {
      return { ...state, owner: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Admin') {
      return { ...state, admin: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Sponsor') {
      return { ...state, sponsor: action.value ? { _eq: accountId } : undefined }
    }
    if (action.type === 'Received') {
      return { ...state, received: action.value ? { _eq: accountId } : undefined }
    }
    return state
  }, undefined)

  const [searchString, setSearchString] = useState<string | undefined>()

  const { fetchMore, data: collections } = useQuery<collectionsData, CollectionsVariables>(
    collectionsQuery,
    {
      variables: {
        limit: 6,
        offset: 0,
      },
    }
  )

  const fetchMoreCollections = useCallback(() => {
    const prettifiedBlockSearchString = searchString?.match(/[^$,.\d]/) ? -1 : searchString
    fetchMore({
      variables: {
        where: {
          ...(searchString && searchString.length > 0
            ? {
                name: { _eq: prettifiedBlockSearchString },
              }
            : {}),
          ...(filter ? { _or: filter } : {}),
        },
      },
    })
  }, [filter, searchString])

  useEffect(() => {
    fetchMoreCollections()
  }, [filter])

  const onCheckBoxChange = useCallback(
    (actionType: ActionType) => (value: boolean) => dispatchFilter({ type: actionType, value }),
    [dispatchFilter]
  )

  const onSearchChange = useCallback(
    (value: string | number | undefined) => setSearchString(value?.toString()),
    [setSearchString]
  )

  const onSearchClick = useCallback(() => {
    fetchMoreCollections()
  }, [fetchMoreCollections, searchString])

  return (
    <>
      <div className={'flexbox-container flexbox-container_space-between margin-top'}>
        <div className={'flexbox-container flexbox-container_half-gap'}>
          <InputText placeholder={'Collection name'} onChange={onSearchChange} />
          <Button title={'Search'} role="primary" onClick={onSearchClick} />
        </div>
        <div className={'flexbox-container'}>
          <Checkbox
            label={'All'}
            size={'s'}
            checked={filter === undefined}
            onChange={onCheckBoxChange('All')}
          />
          <Checkbox
            label={'Owner'}
            size={'s'}
            checked={!!filter?.owner}
            onChange={onCheckBoxChange('Owner')}
          />
          <Checkbox
            label={'Admin'}
            size={'s'}
            checked={!!filter?.admin}
            onChange={onCheckBoxChange('Admin')}
          />
          <Checkbox
            label={'Sponsor'}
            size={'s'}
            checked={!!filter?.sponsor}
            onChange={onCheckBoxChange('Sponsor')}
          />
          <Checkbox
            label={'Received'}
            size={'s'}
            checked={!!filter?.received}
            onChange={onCheckBoxChange('Received')}
          />
        </div>
      </div>
      <div className={'margin-top margin-bottom'}>
        {collections?.collections_aggregate?.aggregate?.count || 0} items
      </div>
      <div className={'grid-container'}>
        {collections?.collections.map((collection) => (
          <CollectionCard key={`collection-${collection.collection_id}`} {...collection} />
        ))}
      </div>
      <Button
        title={'See all'}
        iconRight={{
          color: '#fff',
          name: 'arrow-right',
          size: 12,
        }}
        role="primary"
        onClick={() => {}}
      />
    </>
  )
}

export default CollectionsComponent
