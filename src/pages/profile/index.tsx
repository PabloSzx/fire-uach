import { NextPage } from "next";
import LazyLoad from "react-lazyload";

import { Box, Image, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { LoadingPage } from "../../components/LoadingPage";

const ProfilePage: NextPage = ({}) => {
  const { user, loading } = useUser("profile");

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center" spacing="15em">
      <Text>Bienvenido {user.email}</Text>
      {user.imagesUploaded.map(({ filename, _id }) => {
        return (
          <Box maxHeight="80vh" maxWidth="90vw" key={_id}>
            <LazyLoad height={300} once>
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                src={`/api/images/${filename}`}
              />
            </LazyLoad>
          </Box>
        );
      })}
    </Stack>
  );
};

export default ProfilePage;
