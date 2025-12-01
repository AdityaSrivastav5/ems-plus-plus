"use client";

import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
  credentials: 'same-origin',
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') return { headers };
  
  const token = localStorage.getItem('token');
  const orgId = localStorage.getItem('currentOrgId');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      "x-org-id": orgId || "org-1",
    }
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
