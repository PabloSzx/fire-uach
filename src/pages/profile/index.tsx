import { NextPage } from "next";
import LazyImage from "react-lazy-progressive-image";

import { useMutation } from "@apollo/react-hooks";
import { Box, Button, Image, Spinner, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { LoadingPage } from "../../components/LoadingPage";
import { TagAssociation } from "../../components/TagAssociation";
import { TagImageAssociation } from "../../components/TagImageAssociation";
import { LOGOUT } from "../../graphql/queries";

const ProfilePage: NextPage = ({}) => {
  const { user, loading, refetch } = useUser(
    "profile",
    false,
    "cache-and-network"
  );
  const [logout] = useMutation(LOGOUT, { ignoreResults: true });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center">
      <Text fontSize="3em">
        Bienvenido <b>{user.email}</b>
      </Text>
      <Button
        cursor="pointer"
        variantColor="red"
        onClick={async () => {
          await logout();
          refetch();
        }}
        size="lg"
        fontSize="3xl"
      >
        Salir
      </Button>
      <TagAssociation />

      <Stack align="center" spacing="5em" mt={10}>
        {user.imagesUploaded.map(({ filename, _id, categories }) => {
          return (
            <Box border="1px solid" maxHeight="80vh" maxWidth="90vw" key={_id}>
              <Stack m={5} align="center">
                <Box mb={5}>
                  <LazyImage
                    src={`/api/images/${filename}`}
                    placeholder={`/api/images/${filename}`}
                  >
                    {(src, loading) => {
                      return loading ? (
                        <Spinner size="xl" />
                      ) : (
                        <Image
                          width="100%"
                          height="100%"
                          maxH="40vh"
                          maxW="90vw"
                          objectFit="contain"
                          src={src}
                        />
                      );
                    }}
                  </LazyImage>
                </Box>

                <TagImageAssociation image_id={_id} />
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default ProfilePage;
