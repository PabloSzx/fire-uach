import { head } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Flex, Stack, Tag } from "@chakra-ui/core";

import { ANSWER_TAG_ASSOCIATION, NOT_ANSWERED_TAGS } from "../graphql/queries";
import { useUser } from "./Auth";

export const TagAssociation: FC = () => {
  const { user } = useUser();
  const { data: dataNotAnsweredTags } = useQuery(NOT_ANSWERED_TAGS, {
    fetchPolicy: "cache-first",
  });
  const { push } = useRouter();
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
    return head(dataNotAnsweredTags?.notAnsweredTags);
  }, [dataNotAnsweredTags]);

  if (sampleTag) {
    return (
      <Stack border="1px solid" align="center" p={5}>
        <Box>
          <Badge p={5} fontSize="3em" variant="solid" variantColor="green">
            {sampleTag.name}
          </Badge>
        </Box>
        <Flex wrap="wrap" mt={5} justifyContent="center">
          {sampleTag.possibleTagAssociations.map(({ _id, name }) => {
            return (
              <Tag
                variantColor="green"
                key={_id}
                fontSize="2em"
                p={4}
                m="0.5em"
                cursor="pointer"
                onClick={() => {
                  if (user) {
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
                  } else {
                    push("/login");
                  }
                }}
              >
                {name}
              </Tag>
            );
          })}
        </Flex>
      </Stack>
    );
  }

  return null;
};
