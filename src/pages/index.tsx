import LazyImage from "react-lazy-progressive-image";

import { useQuery } from "@apollo/react-hooks";
import { Box, Image, Spinner, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../components/Auth";
import { TagImageAssociation } from "../components/TagImageAssociation";
import { VALIDATED_IMAGES } from "../graphql/queries";

export default () => {
  const { user } = useUser();
  const { data } = useQuery(VALIDATED_IMAGES, {
    fetchPolicy: "cache-and-network",
  });
  return (
    <Stack align="center" spacing="15em">
      {data?.validatedImages.map(({ filename, _id }) => {
        return (
          <Box maxHeight="80vh" maxWidth="90vw" key={_id}>
            <LazyImage
              src={`/api/images/${filename}`}
              placeholder={`/api/images/${filename}`}
            >
              {(src, loading) => {
                return loading ? (
                  <Spinner />
                ) : (
                  <>
                    <Image
                      width="100%"
                      height="100%"
                      maxH="60vh"
                      maxW="90vw"
                      objectFit="contain"
                      src={src}
                    />
                    {user && <TagImageAssociation image_id={_id} />}
                  </>
                );
              }}
            </LazyImage>
          </Box>
        );
      })}
    </Stack>
  );
};
