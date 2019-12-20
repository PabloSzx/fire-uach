import { useRouter } from "next/router";

import { useQuery } from "@apollo/react-hooks";

import { CURRENT_USER, IUser } from "../graphql/queries";

export function useUser(
  requireAuth?: undefined,
  admin?: undefined,
  fetchPolicy?: "cache-first" | "cache-and-network"
): {
  user: IUser | undefined;
  loading: boolean;
  refetch: () => Promise<any>;
};
export function useUser(
  requireAuth: string,
  admin?: boolean,
  fetchPolicy?: "cache-first" | "cache-and-network"
): { user: IUser; loading: boolean; refetch: () => Promise<any> };
export function useUser(
  requireAuth?: string,
  admin?: boolean,
  fetchPolicy: "cache-first" | "cache-and-network" = "cache-first"
) {
  const { push } = useRouter();

  const { data, error, loading, refetch } = useQuery(CURRENT_USER, {
    ssr: false,
    fetchPolicy,
  });

  if (error) {
    throw error;
  }

  if (
    (requireAuth && !data?.currentUser) ||
    (admin && !data?.currentUser?.admin)
  ) {
    if (!loading) {
      push(`/login?route=${requireAuth}`);
    }
    return {
      user: { email: "", _id: "", admin: false, imagesUploaded: [] },
      loading: true,
      refetch,
    };
  }

  return { user: data?.currentUser, loading, refetch };
}
