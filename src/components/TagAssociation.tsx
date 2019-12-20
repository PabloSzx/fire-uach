import { sample } from "lodash";
import { Dispatch, FC, ReactNode, SetStateAction, useMemo } from "react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Stack, Tag } from "@chakra-ui/core";

import { ANSWER_TAG_ASSOCIATION, NOT_ANSWERED_TAGS } from "../graphql/queries";

export const TagAssociation: FC<{}> = ({}) => {
  const { data: dataNotAnsweredTags } = useQuery(NOT_ANSWERED_TAGS);

  const [answerTagAssociation] = useMutation(ANSWER_TAG_ASSOCIATION, {
    update: (cache, { data }) => {
      if (data?.answerTagAssociation) {
        cache.writeQuery({
          query: NOT_ANSWERED_TAGS,
          data: {
            notAnsweredTags: data.answerTagAssociation,
          },
        });
      }
    },
  });

  const sampleTag = useMemo(() => {
    return sample(dataNotAnsweredTags?.notAnsweredTags);
  }, [dataNotAnsweredTags]);

  if (sampleTag) {
    return (
      <Stack border="1px solid" align="center" p={5} key={1}>
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
