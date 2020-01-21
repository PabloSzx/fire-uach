import { WatchQueryFetchPolicy } from "apollo-client";
import Router from "next/router";

import { useQuery } from "@apollo/react-hooks";

import { CURRENT_USER } from "../graphql/queries";

export function useUser(
  requireAuthRedirect?: string,
  admin?: boolean,
  fetchPolicy: WatchQueryFetchPolicy = "cache-first"
) {
  const { data, error, loading, refetch } = useQuery(CURRENT_USER, {
    ssr: false,
    fetchPolicy,
  });

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    throw error;
  }

  const user = data?.currentUser;

  if ((requireAuthRedirect && !user) || (admin && !user?.admin)) {
    if (!loading) {
      if (user) {
        Router.push("/profile");
      } else {
        Router.push(`/login?route=${requireAuthRedirect}`);
      }
    }
    return {
      user: undefined,
      loading: true,
      refetch,
    };
  }

  return { user, loading, refetch };
}
