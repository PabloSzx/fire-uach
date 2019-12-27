import { truncate } from "lodash";
import { NextPage } from "next";

import { Box, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { LoadingPage } from "../../components/LoadingPage";
import { Logout } from "../../components/Logout";

const ProfilePage: NextPage = ({}) => {
  const { user, loading: loadingUser } = useUser(
    "/profile",
    false,
    "cache-and-network"
  );

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center">
      <Box p={10}>
        <Text fontSize={["1em", "1em", "2em"]} textAlign="center">
          Bienvenido <b>{truncate(user.email, { length: 45 })}</b>
        </Text>
      </Box>
      <Logout />
    </Stack>
  );
};

export default ProfilePage;
