import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import gql, { IGqlClient } from './graphQL/gqlClient'
import rpc, { IRpcClient } from './chainApi/rpcClient'
import chains, { Chain, defaultChain } from '../chains'
import { ApiContextProps, ApiProvider } from './ApiContext'

interface ChainProviderProps {
  children: React.ReactNode
  gqlClient?: IGqlClient
  rpcClient?: IRpcClient
}

const ApiWrapper = ({ gqlClient = gql, rpcClient = rpc, children }: ChainProviderProps) => {
  const { chainId } = useParams<'chainId'>()

  useEffect(() => {
    if (chainId && chains[chainId]) {
      localStorage.setItem('uniq-explorer_chain', chainId)
    }
  }, [chainId])

  const currentChain = useMemo(() => {
    return (
      chains[chainId || ''] ||
      chains[localStorage.getItem('uniq-explorer_chain') || ''] ||
      chains[defaultChain]
    )
  }, [chainId])

  const value = useMemo<ApiContextProps>(
    () => ({
      gql: gqlClient,
      gqlApi: gqlClient.api,
      rpc: rpcClient,
      rpcApi: rpcClient.api,
      currentChain,
    }),
    [gqlClient, rpcClient, currentChain]
  )

  useEffect(() => {
    rpc.changeRpcChain(currentChain)
    gql.changeRpcChain(currentChain)
  }, [currentChain])

  return (
    <ApiProvider value={value}>
      <ApolloProvider client={gqlClient.client}>{children}</ApolloProvider>
    </ApiProvider>
  )
}

export default ApiWrapper
