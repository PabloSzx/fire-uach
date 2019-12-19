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
  const { user, loading, refetch } = useUser("profile");
  const [logout] = useMutation(LOGOUT, { ignoreResults: true });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center">
      <Text>Bienvenido {user.email}</Text>
      <Button
        variantColor="red"
        onClick={async () => {
          await logout();
          refetch();
        }}
      >
        Logout
      </Button>
      <Stack align="center" spacing="5em" mt={10}>
        {user.imagesUploaded.map(({ filename, _id, categories }) => {
          return (
            <Box border="1px solid" maxHeight="80vh" maxWidth="90vw" key={_id}>
              <Box m={5}>
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
                        maxW="70vw"
                        objectFit="contain"
                        src={src}
                      />
                    );
                  }}
                </LazyImage>
                <TagImageAssociation image_id={_id} />
              </Box>
            </Box>
          );
        })}
      </Stack>
      <TagAssociation />
    </Stack>
  );
};

export default ProfilePage;
