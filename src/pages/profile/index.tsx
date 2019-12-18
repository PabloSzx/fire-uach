import { NextPage } from "next";
import LazyImage from "react-lazy-progressive-image";

import { useMutation } from "@apollo/react-hooks";
import { Box, Button, Image, Spinner, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../../components/Auth";
import { LoadingPage } from "../../components/LoadingPage";
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
      <Stack spacing="15em" mt={10}>
        {user.imagesUploaded.map(({ filename, _id }) => {
          return (
            <Box maxHeight="80vh" maxWidth="90vw" key={_id}>
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
                      objectFit="contain"
                      src={src}
                    />
                  );
                }}
              </LazyImage>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default ProfilePage;
