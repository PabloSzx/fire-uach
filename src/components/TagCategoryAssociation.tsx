import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { FiPlay } from "react-icons/fi";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Button, Flex, Stack, Tag } from "@chakra-ui/core";

import {
  ANSWER_TAG_CATEGORY_ASSOCIATION,
  NOT_ANSWERED_TAG,
} from "../graphql/queries";
import { useUser } from "./Auth";
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
  const [selectedCategories, setSelectedCategories] = useState<
    string[] | undefined
  >();

  const { push } = useRouter();
  const [
    answerTagCategoryAssociation,
    { loading: loadingAnswer },
  ] = useMutation(ANSWER_TAG_CATEGORY_ASSOCIATION, {
    update: (cache, { data }) => {
      setSelectedCategories(undefined);
      if (data?.answerTagCategoryAssociation) {
        cache.writeQuery({
          query: NOT_ANSWERED_TAG,
          data: {
            notAnsweredTag: data.answerTagCategoryAssociation,
          },
        });
      }
    },
  });

  if (loadingNotAnsweredTag) {
    return <LoadingPage />;
  }

  const notAnsweredTag = dataNotAnsweredTag?.notAnsweredTag;

  return (
    <Stack align="center" p={5}>
      <AnimatePresence>
        {notAnsweredTag && (
          <motion.div
            key={notAnsweredTag._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Stack align="center">
              <Badge p={5} fontSize="3em" variant="solid" variantColor="green">
                {notAnsweredTag.name}
              </Badge>
            </Stack>
            <Flex wrap="wrap" mt={5} justifyContent="center">
              {notAnsweredTag.categories.map(({ _id, name }) => {
                const selected = selectedCategories?.includes(_id) ?? false;
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
                    onClick={async () => {
                      if (user) {
                        if (selectedCategories?.includes(_id)) {
                          setSelectedCategories(categories =>
                            categories?.filter(cat => cat !== _id)
                          );
                        } else {
                          setSelectedCategories(categories => {
                            return [
                              ...(categories?.filter(cat => cat !== "none") ??
                                []),
                              _id,
                            ];
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
              <Tag
                className="unselectable"
                transition="0.2s all ease-in-out"
                variantColor={
                  selectedCategories?.includes("none") ? "cyan" : "yellow"
                }
                fontSize={
                  selectedCategories?.includes("none")
                    ? ["1.5em", "2em"]
                    : ["1em", "1.7em"]
                }
                p={[2, 4]}
                m={["0.2em", "0.5em"]}
                cursor="pointer"
                onClick={async () => {
                  if (user) {
                    if (selectedCategories?.includes("none")) {
                      setSelectedCategories(undefined);
                    } else {
                      setSelectedCategories(["none"]);
                    }
                  } else {
                    push("/login");
                  }
                }}
              >
                Ninguno de los anteriores
              </Tag>
              <Box alignSelf="center">
                <Button
                  leftIcon={FiPlay}
                  variantColor={
                    (selectedCategories?.length ?? 0) < 1 ? "gray" : "blue"
                  }
                  variant="ghost"
                  size="lg"
                  isLoading={loadingAnswer}
                  cursor="pointer"
                  isDisabled={(selectedCategories?.length ?? 0) < 1}
                  onClick={async () => {
                    if (user) {
                      await answerTagCategoryAssociation({
                        variables: {
                          data: {
                            tag: notAnsweredTag._id,
                            categoriesChosen: selectedCategories?.includes(
                              "none"
                            )
                              ? undefined
                              : selectedCategories,
                            rejectedCategories: notAnsweredTag.categories
                              .filter(cat => {
                                return !selectedCategories?.includes(cat._id);
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
                  Enviar
                </Button>
              </Box>
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
