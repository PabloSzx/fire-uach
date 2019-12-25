import { head, shuffle } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import LazyImage from "react-lazy-progressive-image";

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

  const imageHead = useMemo(() => {
    return head(dataNotAnsweredImages?.notAnsweredImages ?? []);
  }, [dataNotAnsweredImages]);

  if (imageHead) {
    return (
      <Stack border="1px solid" align="center" p={5} spacing="5em" mt={10}>
        <LazyImage
          src={`/api/images/${imageHead.filename}`}
          placeholder={imagePlaceholder}
        >
          {(src, loading) => {
            return (
              <Stack align="center">
                {(loading || loadingAnswer) && <Spinner size="xl" />}
                <Image
                  width="100%"
                  height="100%"
                  maxH="40vh"
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
            return (
              <Tag
                variantColor="cyan"
                cursor="pointer"
                key={_id}
                fontSize="2em"
                p={4}
                m="0.5em"
                onClick={async () => {
                  if (user) {
                    setN(n => n + 1);
                    await answerCategoryImageAssociation({
                      variables: {
                        onlyValidated,
                        data: {
                          category: _id,
                          image: imageHead._id,
                          rejectedCategories: shuffledCategories
                            .filter(category => {
                              return category._id !== _id;
                            })
                            .map(({ _id }) => _id),
                        },
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
        </Flex>
      </Stack>
    );
  }

  return null;
};
