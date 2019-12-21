import { truncate } from "lodash";
import { NextPage } from "next";
import { useMemo } from "react";

import { useMutation } from "@apollo/react-hooks";
import { Box, Button, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { LoadingPage } from "../../components/LoadingPage";
import { TagAssociation } from "../../components/TagAssociation";
import { TagImageAssociation } from "../../components/TagImageAssociation";
import { LOGOUT } from "../../graphql/queries";

const ProfilePage: NextPage = ({}) => {
  const { user, loading: loadingUser, refetch: refetchUser } = useUser(
    "/profile",
    false,
    "cache-and-network"
  );
  const [logout] = useMutation(LOGOUT, { ignoreResults: true });

  const tagAssociationComponent = useMemo(() => {
    return <TagAssociation />;
  }, []);

  const tagImagesComponent = useMemo(() => {
    return user.imagesUploaded.map(({ filename, _id }) => {
      return (
        <TagImageAssociation
          image_id={_id}
          key={_id}
          image_filename={filename}
        />
      );
    });
  }, [user.imagesUploaded]);

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
          refetchUser();
        }}
        size="lg"
        fontSize="3xl"
      >
        Salir
      </Button>
      <Box p={10}>
        <Text fontSize={["1em", "1em", "2em"]} textAlign="center">
          Bienvenido <b>{truncate(user.email, { length: 45 })}</b>
        </Text>
      </Box>

      {tagAssociationComponent}

      {tagImagesComponent}
    </Stack>
  );
};

export default ProfilePage;
