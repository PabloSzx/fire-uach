import { AnimatePresence, motion } from "framer-motion";
import { intersectionBy } from "lodash";
import { useRouter } from "next/router";
import { FC, useContext, useEffect, useState } from "react";
import { useGeolocation } from "react-use";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Flex, Stack, Tag, Text } from "@chakra-ui/core";

import { useTip } from "../components/Tip";
import {
  ANSWER_TAG_CATEGORY_ASSOCIATION,
  NOT_ANSWERED_TAG,
} from "../graphql/queries";
import { useUser } from "./Auth";
import { CategoriesContext } from "./Categories";
import { LoadingPage } from "./LoadingPage";

export const TagCategoryAssociation: FC = () => {
  const { user } = useUser();
  const {
    data: dataNotAnsweredTag,
    error: errorNotAnsweredTag,
    loading: loadingNotAnsweredTag,
  } = useQuery(NOT_ANSWERED_TAG, {
    fetchPolicy: "cache-and-network",
    ssr: false,
  });
  if (errorNotAnsweredTag) {
    console.error(JSON.stringify(errorNotAnsweredTag, null, 2));
  }
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const tipAnswerTag = useTip({});
  const { push } = useRouter();
  const [answerTagCategoryAssociation] = useMutation(
    ANSWER_TAG_CATEGORY_ASSOCIATION,
    {
      update: (cache, { data }) => {
        tipAnswerTag();
        setSelectedCategory(undefined);
        cache.writeQuery({
          query: NOT_ANSWERED_TAG,
          data: {
            notAnsweredTag: data?.answerTagCategoryAssociation,
          },
        });
      },
    }
  );

  const shuffledCategories = useContext(CategoriesContext);

  useEffect(() => {
    tipAnswerTag();
  }, []);

  const { longitude, latitude } = useGeolocation();

  if (loadingNotAnsweredTag) {
    return <LoadingPage />;
  }

  const notAnsweredTag = dataNotAnsweredTag?.notAnsweredTag;

  return (
    <Stack align="center" p={5}>
      <AnimatePresence>
        {notAnsweredTag ? (
          <motion.div
            key={notAnsweredTag._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Stack align="center">
              <Badge
                overflowWrap="break-word"
                p={5}
                m={5}
                fontSize={["2em", "2.5em", "3em"]}
                variant="solid"
                variantColor="green"
                whiteSpace="break-spaces"
                textAlign="center"
                lineHeight="1em"
              >
                {notAnsweredTag.name}
              </Badge>
            </Stack>
            <Flex wrap="wrap" mt={5} justifyContent="center">
              {shuffledCategories.map(({ _id, name }) => {
                const selected = selectedCategory?.includes(_id) ?? false;
                return (
                  <Tag
                    className="unselectable"
                    transition="0.2s all ease-in-out"
                    variantColor={selected ? "cyan" : "green"}
                    key={_id}
                    fontSize={selected ? ["1.5em", "2em"] : ["1em", "1.7em"]}
                    p={[2, 4]}
                    m={["0.2em", "0.5em"]}
                    cursor="pointer"
                    overflowWrap="break-word"
                    onClick={async () => {
                      if (user) {
                        setSelectedCategory(_id);
                        await wait(300);
                        await answerTagCategoryAssociation({
                          variables: {
                            data: {
                              tag: notAnsweredTag._id,
                              categoryChosen: _id,
                              rejectedCategories: shuffledCategories
                                .filter(cat => {
                                  return cat._id !== _id;
                                })
                                .map(({ _id }) => _id),
                              location:
                                latitude && longitude
                                  ? { latitude, longitude }
                                  : undefined,
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
              <Tag
                className="unselectable"
                transition="0.2s all ease-in-out"
                variantColor={selectedCategory === "none" ? "cyan" : "yellow"}
                fontSize={
                  selectedCategory === "none"
                    ? ["1.5em", "2em"]
                    : ["1em", "1.7em"]
                }
                p={[2, 4]}
                m={["0.2em", "0.5em"]}
                cursor="pointer"
                onClick={async () => {
                  if (user) {
                    setSelectedCategory("none");
                    await wait(300);

                    await answerTagCategoryAssociation({
                      variables: {
                        data: {
                          tag: notAnsweredTag._id,
                          categoryChosen: undefined,
                          rejectedCategories: shuffledCategories.map(
                            ({ _id }) => _id
                          ),
                          location:
                            latitude && longitude
                              ? { latitude, longitude }
                              : undefined,
                        },
                      },
                    });
                  } else {
                    push("/login");
                  }
                }}
                overflowWrap="break-word"
              >
                Otra
              </Tag>
            </Flex>
          </motion.div>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Text>Muchas gracias por jugar</Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
