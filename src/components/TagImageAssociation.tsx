import { head } from "lodash";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import LazyImage from "react-lazy-progressive-image";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Box, Flex, Image, Spinner, Stack, Tag } from "@chakra-ui/core";

import {
  ANSWER_TAG_IMAGE_ASSOCIATION,
  IMAGE_TAG_ASSOCIATIONS,
} from "../graphql/queries";
import { useUser } from "./Auth";

export const TagImageAssociation: FC<{
  image_id: string;
  image_filename: string;
}> = ({ image_id, image_filename }) => {
  const { user } = useUser();
  const { push } = useRouter();
  const { data: dataImageTagAssociations } = useQuery(IMAGE_TAG_ASSOCIATIONS, {
    variables: {
      image_id,
    },
    fetchPolicy: "cache-first",
  });
  const [answerImageTagAssociation, { loading: loadingAnswer }] = useMutation(
    ANSWER_TAG_IMAGE_ASSOCIATION,
    {
      update: (cache, { data }) => {
        if (data?.answerTagImageAssociation) {
          cache.writeQuery({
            query: IMAGE_TAG_ASSOCIATIONS,
            variables: {
              image_id,
            },
            data: {
              image: data.answerTagImageAssociation,
            },
          });
        }
      },
    }
  );

  const categoriesNotAnswered =
    dataImageTagAssociations?.image?.categoriesNotAnswered ?? [];

  const sampleCategory = useMemo(() => {
    return head(categoriesNotAnswered);
  }, [categoriesNotAnswered]);

  if (sampleCategory) {
    return (
      <Stack border="1px solid" align="center" p={5} spacing="5em" mt={10}>
        <LazyImage
          src={`/api/images/${image_filename}`}
          placeholder={`/api/images/${image_filename}`}
        >
          {(src, loading) => {
            if (loading) {
              return <Spinner size="xl" />;
            }
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
        <Box mb={0} m={0}>
          <Badge
            variant="solid"
            variantColor="cyan"
            mt={5}
            p={4}
            fontSize="2em"
          >
            {sampleCategory.name}
          </Badge>
        </Box>

        <Flex wrap="wrap" mt={5} justifyContent="center">
          {sampleCategory.tags.map(({ _id, name }) => {
            return (
              <Tag
                variantColor="cyan"
                cursor="pointer"
                key={_id}
                fontSize="2em"
                p={4}
                ml="0.5em"
                mr="0.5em"
                onClick={() => {
                  if (user) {
                    answerImageTagAssociation({
                      variables: {
                        data: {
                          category: sampleCategory._id,
                          image: image_id,
                          tag: _id,
                          rejectedTags: sampleCategory.tags
                            .filter(tag => {
                              return tag._id !== _id;
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
