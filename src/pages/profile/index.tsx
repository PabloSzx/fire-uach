import { truncate } from "lodash";
import { NextPage } from "next";

import { useMutation } from "@apollo/react-hooks";
import { Box, Button, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { CategoryImageAssociation } from "../../components/CategoryImageAssociation";
import { LoadingPage } from "../../components/LoadingPage";
import { TagCategoryAssociation } from "../../components/TagCategoryAssociation";
import { CURRENT_USER, LOGOUT } from "../../graphql/queries";

const ProfilePage: NextPage = ({}) => {
  const { user, loading: loadingUser, refetch: refetchUser } = useUser(
    "/profile",
    false,
    "cache-and-network"
  );
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

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center">
      <Button
        cursor="pointer"
        variantColor="red"
        onClick={async () => {
          await logout();
        }}
        size="lg"
        fontSize="3xl"
        isLoading={loadingLogout}
      >
        Salir
      </Button>
      <Box p={10}>
        <Text fontSize={["1em", "1em", "2em"]} textAlign="center">
          Bienvenido <b>{truncate(user.email, { length: 45 })}</b>
        </Text>
      </Box>

      <TagCategoryAssociation />

      <CategoryImageAssociation onlyValidated={false} />
    </Stack>
  );
};

export default ProfilePage;
