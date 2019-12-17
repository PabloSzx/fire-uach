import LazyLoad from "react-lazyload";

import { useQuery } from "@apollo/react-hooks";
import { Box, Image, Stack } from "@chakra-ui/core";

import { VALIDATED_IMAGES } from "../graphql/queries";

export default () => {
  const { data } = useQuery(VALIDATED_IMAGES);
  return (
    <Stack align="center" spacing="15em">
      {data?.validatedImages.map(({ filename, _id }) => {
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
