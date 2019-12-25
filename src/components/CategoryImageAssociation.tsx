import { AnimatePresence, motion } from "framer-motion";
import { head, shuffle } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Flex, Image, Spinner, Stack, Tag } from "@chakra-ui/core";

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
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
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
      setSelectedCategory(undefined);
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
  const [isVisible, setIsVisible] = useState(false);

  const shuffledCategories = useMemo(() => {
    return shuffle(dataCategories?.categories);
  }, [dataCategories, n]);

  const headImage = useMemo(() => {
    setIsVisible(true);
    setN(n => n + 1);
    return head(dataNotAnsweredImages?.notAnsweredImages ?? []);
  }, [dataNotAnsweredImages, setIsVisible, setN]);

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
                  <Image
                    width="100%"
                    height="100%"
                    maxH="40vh"
                    maxW="90vw"
                    objectFit="contain"
                    src={src}
                  />
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
                    fontSize={selected ? "2.5em" : "2em"}
                    p={4}
                    m="0.5em"
                    onClick={async () => {
                      if (user) {
                        if (selectedCategory === undefined && isVisible) {
                          setSelectedCategory(_id);
                          setIsVisible(false);
                          await wait(300);

                          await answerCategoryImageAssociation({
                            variables: {
                              onlyValidated,
                              data: {
                                category: _id,
                                image: headImage._id,
                                rejectedCategories: shuffledCategories
                                  .filter(category => {
                                    return category._id !== _id;
                                  })
                                  .map(({ _id }) => _id),
                              },
                            },
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
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
