import { useState } from "react";
import LazyImage from "react-lazy-progressive-image";

import { useQuery } from "@apollo/react-hooks";
import { Box, Image, Spinner, Stack, Text } from "@chakra-ui/core";

import { useUser } from "../components/Auth";
import { TagImageAssociation } from "../components/TagImageAssociation";
import { VALIDATED_IMAGES } from "../graphql/queries";

export default () => {
  const { user } = useUser();
  const { data: dataValidatedImages } = useQuery(VALIDATED_IMAGES, {
    fetchPolicy: "cache-and-network",
  });
  // const { data: dataResultTagImageAssociations } = useQuery(
  //   RESULTS_TAG_IMAGE_ASSOCIATIONS,
  //   {
  //     skip: !user,
  //   }
  // );

  return (
    <Stack align="center" spacing="2em">
      {dataValidatedImages?.validatedImages.map(({ filename, _id }) => {
        return (
          <TagImageAssociation
            image_id={_id}
            key={_id}
            image_filename={filename}
          />
        );
      })}
    </Stack>
  );
};
