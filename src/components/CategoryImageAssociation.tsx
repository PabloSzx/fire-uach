import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { FC, useContext, useEffect, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import { useGeolocation } from "react-use";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Flex, Image, Spinner, Stack, Tag, Text } from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import { useTip } from "../components/Tip";
import {
  ANSWER_CATEGORY_IMAGE_ASSOCIATION,
  NOT_ANSWERED_IMAGE,
} from "../graphql/queries";
import { useUser } from "./Auth";
import { CategoriesContext } from "./Categories";
import { LoadingPage } from "./LoadingPage";

export const CategoryImageAssociation: FC<{
  onlyOwnImages?: boolean;
}> = ({ onlyOwnImages }) => {
  const tipAnswerImage = useTip({});
  const { user } = useUser();
  const { push } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  const {
    data: dataNotAnsweredImage,
    error: errorNotAnsweredImage,
    loading: loadingNotAnsweredImage,
  } = useQuery(NOT_ANSWERED_IMAGE, {
    fetchPolicy: "cache-and-network",
    ssr: false,
    variables: {
      onlyOwnImages,
    },
  });

  if (errorNotAnsweredImage) {
    console.error(JSON.stringify(errorNotAnsweredImage, null, 2));
  }
  const [answerCategoryImageAssociation] = useMutation(
    ANSWER_CATEGORY_IMAGE_ASSOCIATION,
    {
      update: (cache, { data }) => {
        tipAnswerImage();
        setSelectedCategory(undefined);
        cache.writeQuery({
          query: NOT_ANSWERED_IMAGE,
          variables: {
            onlyOwnImages,
          },
          data: {
            notAnsweredImage: data?.answerCategoryImageAssociation,
          },
        });
      },
    }
  );

  const shuffledCategories = useContext(CategoriesContext);

  useEffect(() => {
    tipAnswerImage();
  }, []);

  const { longitude, latitude } = useGeolocation();

  if (loadingNotAnsweredImage) {
    return <LoadingPage />;
  }

  const notAnsweredImage = dataNotAnsweredImage?.notAnsweredImage;

  return (
    <Stack align="center" spacing="5em">
      <AnimatePresence>
        {notAnsweredImage ? (
          <motion.div
            key={notAnsweredImage?._id}
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
                const selected = selectedCategory === _id;
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
                        setSelectedCategory(_id);
                        await wait(300);
                        await answerCategoryImageAssociation({
                          variables: {
                            data: {
                              image: notAnsweredImage._id,
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
                            onlyOwnImages,
                          },
                        });
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
                variantColor={selectedCategory === "none" ? "cyan" : "yellow"}
                fontSize={
                  selectedCategory === "none"
                    ? ["1.5em", "2em"]
                    : ["1em", "1.7em"]
                }
                p={[2, 4]}
                m={["0.2em"]}
                cursor="pointer"
                onClick={async () => {
                  if (user) {
                    setSelectedCategory("none");
                    await wait(300);
                    await answerCategoryImageAssociation({
                      variables: {
                        data: {
                          image: notAnsweredImage._id,
                          categoryChosen: undefined,
                          rejectedCategories: shuffledCategories.map(
                            ({ _id }) => _id
                          ),
                          location:
                            latitude && longitude
                              ? { latitude, longitude }
                              : undefined,
                        },
                        onlyOwnImages,
                      },
                    });
                  } else {
                    push("/login");
                  }
                }}
                overflowWrap="break-word"
              >
                Ninguna
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
            <Text p={4} border="1px solid" borderRadius="10px">
              Puedes subir más imágenes para seguir jugando
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
