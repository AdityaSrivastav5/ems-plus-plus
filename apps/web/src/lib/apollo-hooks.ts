"use client";

// Re-export Apollo Client hooks to fix Next.js 15 bundling issues
export { useQuery, useMutation, useLazyQuery, useSubscription } from '@apollo/client/react/hooks';
export { gql } from '@apollo/client/core';
export type { ApolloError, ApolloQueryResult } from '@apollo/client';
