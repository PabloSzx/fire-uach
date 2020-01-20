import { useRouter } from "next/router";

import { useQuery } from "@apollo/react-hooks";

import { CURRENT_USER, IUser } from "../graphql/queries";

export function useUser(
  requireAuthRedirect?: undefined,
  admin?: undefined,
  fetchPolicy?: "cache-first" | "cache-and-network"
): {
  user: IUser | undefined;
  loading: boolean;
  refetch: () => Promise<any>;
};
export function useUser(
  requireAuthRedirect: string,
  admin?: boolean,
  fetchPolicy?: "cache-first" | "cache-and-network"
): { user: IUser; loading: boolean; refetch: () => Promise<any> };
export function useUser(
  requireAuthRedirect?: string,
  admin?: boolean,
  fetchPolicy: "cache-first" | "cache-and-network" = "cache-first"
) {
  const { push } = useRouter();

  const { data, error, loading, refetch } = useQuery(CURRENT_USER, {
    ssr: false,
    fetchPolicy,
  });

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    throw error;
  }

  const user = data?.currentUser;

  if ((requireAuthRedirect && user) || (admin && !user?.admin)) {
    if (!loading) {
      if (user) {
        push("/profile");
      } else {
        push(`/login?route=${requireAuthRedirect}`);
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
