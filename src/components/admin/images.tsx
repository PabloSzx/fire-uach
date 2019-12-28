import { chunk, toInteger } from "lodash";
import { FC, useMemo, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import { Checkbox, Icon, Pagination } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import wait from "waait";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Box, Button, Flex, Image, Spinner, Stack, Tag } from "@chakra-ui/core";

import { imagePlaceholder } from "../../../constants";
import {
  EDIT_IMAGE,
  IImage,
  IMAGES,
  REMOVE_IMAGE,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

const ImageEdit: FC<IImage> = ({ _id, filename, uploader, validated }) => {
  const [editImage, { loading: loadingEditImage }] = useMutation(EDIT_IMAGE);
  const [removeImage, { loading: loadingRemoveImage }] = useMutation(
    REMOVE_IMAGE,
    {
      update: (cache, { data }) => {
        if (data?.removeImage) {
          cache.writeQuery({
            query: IMAGES,
            data: {
              images: data.removeImage,
            },
          });
        }
      },
    }
  );

  const [isValidated, setIsValidated] = useState(validated);

  return (
    <Stack
      dir="column"
      display="flex"
      p={2}
      border="1px solid"
      textAlign="center"
      justifyContent="center"
      align="center"
    >
      <Box>
        <LazyImage
          src={`/api/images/${filename}`}
          placeholder={imagePlaceholder}
        >
          {(src, loading) => {
            return (
              <Stack align="center">
                {loading && <Spinner />}
                <Image
                  pos="relative"
                  w="100%"
                  h="100%"
                  maxH="40vh"
                  maxW="70vw"
                  objectFit="contain"
                  src={src}
                />
              </Stack>
            );
          }}
        </LazyImage>
      </Box>
      {uploader?.email && (
        <Box>
          <Tag>Subido por:</Tag>

          <Tag variantColor="blue">{uploader?.email}</Tag>
        </Box>
      )}

      <Flex align="center" justify="center">
        <Tag>Vista pública</Tag>
        <Checkbox
          toggle
          checked={isValidated}
          onChange={async (_e, { checked }) => {
            if (checked !== undefined) {
              setIsValidated(checked);
              await wait(500);
              await editImage({
                variables: {
                  data: {
                    _id,
                    validated: checked,
                  },
                },
              });
            }
          }}
        />
      </Flex>

      <Box>
        <Confirm
          content={`¿Está seguro que desea eliminar la imagen ${filename}?`}
          confirmButton="Estoy seguro"
          cancelButton="Cancelar"
        >
          <Button
            variantColor="red"
            onClick={() => {
              removeImage({
                variables: {
                  data: {
                    _id,
                  },
                },
              });
            }}
            isLoading={loadingRemoveImage}
            isDisabled={loadingRemoveImage}
          >
            Eliminar Imagen
          </Button>
        </Confirm>
      </Box>
    </Stack>
  );
};

const AdminImages: FC = () => {
  const {
    data: dataImages,
    loading: loadingDataImages,
    refetch: refetchAllImages,
  } = useQuery(IMAGES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const paginatedImages = useMemo(() => {
    return chunk(dataImages?.images, 10) ?? [];
  }, [dataImages]);

  const [activePagination, setActivePagination] = useRememberState(
    "admin_active_pagination",
    1
  );

  return (
    <Stack pt={5} spacing="2em" align="center">
      {loadingDataImages ? (
        <Spinner />
      ) : (
        <Box cursor="pointer">
          <Icon
            disabled={loadingDataImages}
            name="repeat"
            onClick={() => {
              refetchAllImages();
            }}
          />
        </Box>
      )}

      <Pagination
        activePage={activePagination}
        onPageChange={(_e, { activePage }) => {
          setActivePagination(toInteger(activePage));
        }}
        totalPages={paginatedImages.length}
      />

      <Box mt={3}>
        {paginatedImages[activePagination - 1]?.map(image => {
          return <ImageEdit key={image._id} {...image} />;
        })}
      </Box>
    </Stack>
  );
};

export default AdminImages;
