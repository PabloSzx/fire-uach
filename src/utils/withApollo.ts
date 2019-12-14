import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { createUploadLink } from "apollo-upload-client";
import nextWithApollo from "next-with-apollo";

import { GRAPHQL_URL } from "../../constants";

declare module "next" {
  export interface NextPageContext {
    apolloClient: ApolloClient<NormalizedCacheObject>;
  }
}

export const withApollo = nextWithApollo(({ initialState }) => {
  return new ApolloClient({
    link: createUploadLink({
      uri: GRAPHQL_URL,
      includeExtensions: true,
    }),
    cache: new InMemoryCache({}).restore(initialState || {}),
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
});
