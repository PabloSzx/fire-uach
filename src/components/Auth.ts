import { useRouter } from "next/router";

import { useQuery } from "@apollo/react-hooks";

import { CURRENT_USER, IUser } from "../graphql/queries";

export function useUser(): { user?: IUser; loading: boolean };
export function useUser(requireAuth: string): { user: IUser; loading: boolean };
export function useUser(requireAuth?: string) {
  const { push } = useRouter();

  const { data, error, loading } = useQuery(CURRENT_USER, {
    ssr: false,
  });

  if (error) {
    throw error;
  }

  if (requireAuth && !data?.currentUser) {
    if (!loading) {
      push(`/login?route=${requireAuth}`);
    }
    return {
      user: { email: "", _id: "" },
      loading: true,
    };
  }

  return { user: data?.currentUser, loading };
}
