import { differenceWith, sample } from "lodash";
import { FC, useMemo } from "react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Stack, Tag } from "@chakra-ui/core";

import {
  ANSWER_TAG_IMAGE_ASSOCIATION,
  IMAGE_TAG_ASSOCIATIONS,
  RESULTS_TAG_IMAGE_ASSOCIATIONS,
} from "../graphql/queries";

export const TagImageAssociation: FC<{
  image_id: string;
}> = ({ image_id }) => {
  const { data: resultsTagImageAssociations } = useQuery(
    RESULTS_TAG_IMAGE_ASSOCIATIONS
  );

  const [answerImageTagAssociation] = useMutation(
    ANSWER_TAG_IMAGE_ASSOCIATION,
    {
      update: (cache, { data }) => {
        if (data?.answerTagImageAssociation) {
          cache.writeQuery({
            query: RESULTS_TAG_IMAGE_ASSOCIATIONS,
            data: {
              resultsTagImageAssociations: data.answerTagImageAssociation,
            },
          });
        }
      },
    }
  );
  const { data: dataImageTagAssociations } = useQuery(IMAGE_TAG_ASSOCIATIONS, {
    variables: {
      image_id,
    },
  });

  const sampleCategory = useMemo(() => {
    if (
      resultsTagImageAssociations?.resultsTagImageAssociations &&
      dataImageTagAssociations?.image?.categories
    ) {
      return sample(
        differenceWith(
          dataImageTagAssociations.image.categories,
          resultsTagImageAssociations.resultsTagImageAssociations,
          (dataCategory, { category: resultCategory }) => {
            if (resultCategory) {
              return dataCategory._id === resultCategory._id;
            }

            return false;
          }
        )
      );
    }

    return undefined;
  }, [dataImageTagAssociations, resultsTagImageAssociations]);

  if (sampleCategory) {
    return (
      <Stack border="1px solid" align="center">
        <Badge>{`Category ${sampleCategory.name}`}</Badge>

        <Stack isInline spacing="3em">
          {sampleCategory.tags.map(({ _id, name }) => {
            return (
              <Tag
                key={_id}
                onClick={() => {
                  answerImageTagAssociation({
                    variables: {
                      data: {
                        category: sampleCategory._id,
                        image: image_id,
                        tag: _id,
                        rejectedTags: sampleCategory.tags
                          .filter(tag => {
                            return tag._id !== _id;
                          })
                          .map(({ _id }) => _id),
                      },
                    },
                  });
                }}
              >
                {name}
              </Tag>
            );
          })}
        </Stack>
      </Stack>
    );
  }
  return null;
};
