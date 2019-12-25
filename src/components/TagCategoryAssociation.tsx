import { AnimatePresence, motion } from "framer-motion";
import { head } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Flex, Stack, Tag } from "@chakra-ui/core";

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
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  const { push } = useRouter();
  const [answerTagCategoryAssociation] = useMutation(
    ANSWER_TAG_CATEGORY_ASSOCIATION,
    {
      update: (cache, { data }) => {
        setSelectedCategory(undefined);
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

  const [isVisible, setIsVisible] = useState(false);

  const headTag = useMemo(() => {
    setIsVisible(true);
    return head(dataNotAnsweredTags?.notAnsweredTags ?? []);
  }, [dataNotAnsweredTags, setIsVisible]);

  return (
    <Stack align="center" p={5}>
      <AnimatePresence>
        {headTag && (
          <motion.div
            key={headTag._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Stack align="center">
              <Badge p={5} fontSize="3em" variant="solid" variantColor="green">
                {headTag.name}
              </Badge>
            </Stack>
            <Flex wrap="wrap" mt={5} justifyContent="center">
              {headTag.categories.map(({ _id, name }) => {
                const selected = selectedCategory === _id;
                return (
                  <Tag
                    className="unselectable"
                    transition="0.2s all ease-in-out"
                    variantColor={selected ? "cyan" : "green"}
                    key={_id}
                    fontSize={selected ? "2.5em" : "2em"}
                    p={4}
                    m="0.5em"
                    cursor="pointer"
                    onClick={async () => {
                      if (user) {
                        if (selectedCategory === undefined && isVisible) {
                          setSelectedCategory(_id);
                          setIsVisible(false);
                          await wait(300);

                          await answerTagCategoryAssociation({
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
                        }
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
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
