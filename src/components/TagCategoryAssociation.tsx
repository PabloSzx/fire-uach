import { head } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Flex, Stack, Tag } from "@chakra-ui/core";

import {
  ANSWER_TAG_CATEGORY_ASSOCIATION,
  NOT_ANSWERED_TAGS,
} from "../graphql/queries";
import { useUser } from "./Auth";

export const TagCategoryAssociation: FC = () => {
  const { user } = useUser();
  const { data: dataNotAnsweredTags, error: errorNotAnsweredTags } = useQuery(
    NOT_ANSWERED_TAGS,
    {
      fetchPolicy: "cache-and-network",
      ssr: false,
    }
  );
  if (errorNotAnsweredTags) {
    console.error(JSON.stringify(errorNotAnsweredTags, null, 2));
  }
  const { push } = useRouter();
  const [answerTagCategoryAssociation] = useMutation(
    ANSWER_TAG_CATEGORY_ASSOCIATION,
    {
      update: (cache, { data }) => {
        if (data?.answerTagCategoryAssociation) {
          cache.writeQuery({
            query: NOT_ANSWERED_TAGS,
            data: {
              notAnsweredTags: data.answerTagCategoryAssociation,
            },
          });
        }
      },
    }
  );

  const headTag = useMemo(() => {
    return head(dataNotAnsweredTags?.notAnsweredTags ?? []);
  }, [dataNotAnsweredTags]);

  if (headTag) {
    return (
      <Stack border="1px solid" align="center" p={5}>
        <Box>
          <Badge p={5} fontSize="3em" variant="solid" variantColor="green">
            {headTag.name}
          </Badge>
        </Box>
        <Flex wrap="wrap" mt={5} justifyContent="center">
          {headTag.categories.map(({ _id, name }) => {
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
                    answerTagCategoryAssociation({
                      variables: {
                        data: {
                          tag: headTag._id,
                          categoryChosen: _id,
                          rejectedCategories: headTag.categories
                            .filter(category => {
                              return category._id !== _id;
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
