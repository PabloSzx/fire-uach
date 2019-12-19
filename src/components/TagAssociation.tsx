import { differenceWith, sample } from "lodash";
import { FC, useMemo } from "react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Flex, Stack, Tag } from "@chakra-ui/core";

import {
  ALL_TAGS_WITH_ASSOCIATIONS,
  ANSWER_TAG_ASSOCIATION,
  RESULTS_TAG_ASSOCIATIONS,
} from "../graphql/queries";

export const TagAssociation: FC = () => {
  const { data: dataResultsTagAssociations } = useQuery(
    RESULTS_TAG_ASSOCIATIONS,
    {
      fetchPolicy: "cache-and-network",
    }
  );
  const [answerTagAssociation] = useMutation(ANSWER_TAG_ASSOCIATION, {
    update: (cache, { data }) => {
      if (data?.answerTagAssociation) {
        cache.writeQuery({
          query: RESULTS_TAG_ASSOCIATIONS,
          data: {
            resultsTagAssociations: data.answerTagAssociation,
          },
        });
      }
    },
  });

  const { data: dataAllTagsWithAssociations } = useQuery(
    ALL_TAGS_WITH_ASSOCIATIONS
  );

  const sampleTag = useMemo(() => {
    if (
      dataResultsTagAssociations?.resultsTagAssociations &&
      dataAllTagsWithAssociations?.tags
    ) {
      return sample(
        differenceWith(
          dataAllTagsWithAssociations.tags,
          dataResultsTagAssociations.resultsTagAssociations,
          (dataTag, { tagMain }) => {
            if (tagMain) {
              return dataTag._id === tagMain._id;
            }
            return false;
          }
        )
      );
    }
    return undefined;
  }, [dataAllTagsWithAssociations, dataResultsTagAssociations]);

  if (sampleTag) {
    return (
      <Stack border="1px solid" align="center" p={5}>
        <Box>
          <Badge p={5} fontSize="3em">
            {sampleTag.name}
          </Badge>
        </Box>
        <Stack isInline spacing="1em" mt={5}>
          {sampleTag.possibleTagAssociations.map(({ _id, name }) => {
            return (
              <Tag
                key={_id}
                fontSize="2em"
                p={4}
                cursor="pointer"
                onClick={() => {
                  answerTagAssociation({
                    variables: {
                      data: {
                        tagMain: sampleTag._id,
                        tagChosen: _id,
                        rejectedTags: sampleTag.possibleTagAssociations
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
