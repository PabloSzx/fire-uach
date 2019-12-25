import { AnimatePresence, motion } from "framer-motion";
import { head, shuffle } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import { FiPlay } from "react-icons/fi";
import LazyImage from "react-lazy-progressive-image";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Box, Button, Flex, Image, Stack, Tag } from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import {
  ANSWER_CATEGORY_IMAGE_ASSOCIATION,
  CATEGORIES_OPTIONS,
  NOT_ANSWERED_IMAGES,
} from "../graphql/queries";
import { useUser } from "./Auth";

export const CategoryImageAssociation: FC<{
  onlyValidated?: boolean;
}> = ({ onlyValidated = false }) => {
  const { user } = useUser();
  const { push } = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<
    string[] | undefined
  >();

  const {
    data: dataNotAnsweredImages,
    error: errorNotAnsweredImages,
  } = useQuery(NOT_ANSWERED_IMAGES, {
    variables: {
      onlyValidated,
    },
    fetchPolicy: "cache-and-network",
    ssr: false,
  });

  if (errorNotAnsweredImages) {
    console.error(JSON.stringify(errorNotAnsweredImages, null, 2));
  }
  const { data: dataCategories } = useQuery(CATEGORIES_OPTIONS);
  const [
    answerCategoryImageAssociation,
    { loading: loadingAnswer },
  ] = useMutation(ANSWER_CATEGORY_IMAGE_ASSOCIATION, {
    update: (cache, { data }) => {
      setSelectedCategories(undefined);
      if (data?.answerCategoryImageAssociation) {
        cache.writeQuery({
          query: NOT_ANSWERED_IMAGES,
          variables: {
            onlyValidated,
          },
          data: {
            notAnsweredImages: data.answerCategoryImageAssociation,
          },
        });
      }
    },
  });

  const [n, setN] = useState(0);

  const shuffledCategories = useMemo(() => {
    return shuffle(dataCategories?.categories);
  }, [dataCategories, n]);

  const headImage = useMemo(() => {
    setN(n => n + 1);
    return head(dataNotAnsweredImages?.notAnsweredImages ?? []);
  }, [dataNotAnsweredImages, setN]);

  return (
    <Stack align="center" p={5} spacing="5em" mt={10}>
      <AnimatePresence>
        {headImage && (
          <motion.div
            key={headImage._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <LazyImage
              src={`/api/images/${headImage.filename}`}
              placeholder={imagePlaceholder}
            >
              {src => {
                return (
                  <Box
                    width="100%"
                    className="image_box"
                    alignSelf="center"
                    textAlign="center"
                  >
                    <Image
                      width="100%"
                      height="100%"
                      maxH="40vh"
                      maxW="90vw"
                      objectFit="contain"
                      src={src}
                    />
                  </Box>
                );
              }}
            </LazyImage>

            <Flex wrap="wrap" mt={5} justifyContent="center">
              {shuffledCategories.map(({ _id, name }) => {
                const selected = selectedCategories?.includes(_id) ?? false;
                return (
                  <Tag
                    className="unselectable"
                    transition="0.2s all ease-in-out"
                    variantColor={selected ? "cyan" : "green"}
                    cursor="pointer"
                    key={_id}
                    fontSize={selected ? "2.5em" : "2em"}
                    p={4}
                    m="0.5em"
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
                        await push("/login");
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
                  cursor="pointer"
                  isDisabled={(selectedCategories?.length ?? 0) < 1}
                  isLoading={loadingAnswer}
                  onClick={async () => {
                    if (user) {
                      await answerCategoryImageAssociation({
                        variables: {
                          onlyValidated,
                          data: {
                            image: headImage._id,
                            categoriesChosen: selectedCategories?.includes(
                              "none"
                            )
                              ? undefined
                              : selectedCategories,
                            rejectedCategories: shuffledCategories
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
