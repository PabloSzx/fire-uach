import { useQuery } from "@apollo/react-hooks";
import { Stack } from "@chakra-ui/core";

import { TagAssociation } from "../components/TagAssociation";
import { TagImageAssociation } from "../components/TagImageAssociation";
import { VALIDATED_IMAGES } from "../graphql/queries";

export default () => {
  const { data: dataValidatedImages } = useQuery(VALIDATED_IMAGES, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <Stack align="center" spacing="2em">
      <TagAssociation />
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
