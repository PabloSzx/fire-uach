import { FC } from "react";
import { FiLogOut } from "react-icons/fi";

import { useMutation } from "@apollo/react-hooks";
import { Button } from "@chakra-ui/core";

import { CURRENT_USER, LOGOUT } from "../graphql/queries";

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
      mt="5em"
    >
      Cerrar sesión
    </Button>
  );
};
