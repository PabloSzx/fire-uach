import { AnimatePresence, motion } from "framer-motion";
import { head } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import { FiPlay } from "react-icons/fi";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Stack,
  Tag,
} from "@chakra-ui/core";

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
  const [selectedCategories, setSelectedCategories] = useState<
    string[] | undefined
  >();

  const { push } = useRouter();
  const [answerTagCategoryAssociation] = useMutation(
    ANSWER_TAG_CATEGORY_ASSOCIATION,
    {
      update: (cache, { data }) => {
        setSelectedCategories(undefined);
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

                        await wait(300);
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
                    await wait(300);
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
                  cursor="pointer"
                  isDisabled={(selectedCategories?.length ?? 0) < 1}
                  onClick={async () => {
                    if (user) {
                      await answerTagCategoryAssociation({
                        variables: {
                          data: {
                            tag: headTag._id,
                            categoriesChosen: selectedCategories?.includes(
                              "none"
                            )
                              ? undefined
                              : selectedCategories,
                            rejectedCategories: headTag.categories
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
