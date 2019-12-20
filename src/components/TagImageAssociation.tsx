import { sample } from "lodash";
import { Dispatch, FC, SetStateAction, useMemo } from "react";
import LazyImage from "react-lazy-progressive-image";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Badge, Image, Spinner, Stack, Tag } from "@chakra-ui/core";

import {
  ANSWER_TAG_IMAGE_ASSOCIATION,
  IMAGE_TAG_ASSOCIATIONS,
} from "../graphql/queries";

export const TagImageAssociation: FC<{
  image_id: string;
  image_filename: string;
}> = ({ image_id, image_filename }) => {
  const { data: dataImageTagAssociations } = useQuery(IMAGE_TAG_ASSOCIATIONS, {
    onCompleted: data => {},
    variables: {
      image_id,
    },
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
    return sample(categoriesNotAnswered);
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
        <Badge p={3}>{sampleCategory.name}</Badge>

        <Stack isInline spacing="3em" mt={5}>
          {sampleCategory.tags.map(({ _id, name }) => {
            return (
              <Tag
                cursor="pointer"
                key={_id}
                onClick={() => {
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
                }}
              >
                {name}
              </Tag>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  return null;
};
