import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";

import { useMutation } from "@apollo/react-hooks";
import { Button } from "@chakra-ui/core";

import { CURRENT_USER, LOGOUT } from "../graphql/queries";
import { useUser } from "./Auth";
import { LoadingPage } from "./LoadingPage";

export const Logout: FC = () => {
  const [logout, { loading: loadingLogout }] = useMutation(LOGOUT, {
    update: cache => {
      cache.writeQuery({
        query: CURRENT_USER,
        data: {
          currentUser: null,
        },
      });
    },
  });
  const { user, loading } = useUser();
  const { push } = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      push("/login");
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Button
      alignSelf="center"
      cursor="pointer"
      variantColor="red"
      onClick={async () => {
        await logout();
      }}
      size="lg"
      fontSize="3xl"
      isLoading={loadingLogout}
      leftIcon={FiLogOut}
    >
      Cerrar sesión
    </Button>
  );
};
