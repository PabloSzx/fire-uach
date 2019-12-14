import { useRouter } from "next/router";

import { useQuery } from "@apollo/react-hooks";

import { CURRENT_USER } from "../graphql/queries";

export function useUser(requireAuth?: string) {
  const { push } = useRouter();
  const { data, error, loading } = useQuery(CURRENT_USER, {
    ssr: false,
  });
  if (error) {
    throw error;
  }
  if (requireAuth && !loading && !data?.currentUser) {
    push(`/login?route=${requireAuth}`);
  }
  return { user: data?.currentUser, loading };
}
