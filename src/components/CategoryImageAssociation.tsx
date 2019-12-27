import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import { FiPlay } from "react-icons/fi";
import LazyImage from "react-lazy-progressive-image";
import { useOrientation } from "react-use";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Flex,
  Image,
  Spinner,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import {
  ANSWER_CATEGORY_IMAGE_ASSOCIATION,
  CATEGORIES_OPTIONS,
  NOT_ANSWERED_IMAGE,
} from "../graphql/queries";
import { useUser } from "./Auth";
import { LoadingPage } from "./LoadingPage";

export const CategoryImageAssociation: FC = () => {
  const { user } = useUser();
  const { push } = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<
    string[] | undefined
  >();

  const {
    data: dataNotAnsweredImage,
    error: errorNotAnsweredImage,
    loading: loadingNotAnsweredImage,
  } = useQuery(NOT_ANSWERED_IMAGE, {
    fetchPolicy: "cache-and-network",
    ssr: false,
  });

  if (errorNotAnsweredImage) {
    console.error(JSON.stringify(errorNotAnsweredImage, null, 2));
  }
  const { data: dataCategories } = useQuery(CATEGORIES_OPTIONS);
  const [
    answerCategoryImageAssociation,
    { loading: loadingAnswer },
  ] = useMutation(ANSWER_CATEGORY_IMAGE_ASSOCIATION, {
    update: (cache, { data }) => {
      setSelectedCategories(undefined);
      cache.writeQuery({
        query: NOT_ANSWERED_IMAGE,
        data: {
          notAnsweredImage: data?.answerCategoryImageAssociation,
        },
      });
    },
  });

  const shuffledCategories = useMemo(() => {
    return dataCategories?.categories ?? [];
  }, [dataCategories]);

  const { type: orientation } = useOrientation();

  if (loadingNotAnsweredImage) {
    return <LoadingPage />;
  }

  const notAnsweredImage = dataNotAnsweredImage?.notAnsweredImage;

  return (
    <Stack align="center" spacing="5em">
      <AnimatePresence>
        {notAnsweredImage ? (
          <motion.div
            key={notAnsweredImage._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <LazyImage
              src={`/api/images/${notAnsweredImage.filename}`}
              placeholder={imagePlaceholder}
            >
              {src => {
                return (
                  <Stack
                    align="center"
                    width="100%"
                    className="image_box"
                    alignSelf="center"
                    textAlign="center"
                  >
                    {src === imagePlaceholder && <Spinner />}
                    <Image
                      width="100%"
                      height="100%"
                      maxH={["40vh", "40vh", "65vh"]}
                      maxW="90vw"
                      objectFit="contain"
                      src={src}
                    />
                  </Stack>
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
                    fontSize={selected ? ["1.5em", "2em"] : ["1em", "1.7em"]}
                    p={[2, 4]}
                    m={["0.2em"]}
                    overflowWrap="break-word"
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
                m={["0.2em"]}
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
                overflowWrap="break-word"
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
                          data: {
                            image: notAnsweredImage._id,
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
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <Text>Puede subir más imágenes para seguir jugando</Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
