import { FC, useCallback, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import Select from "react-select";
import { useSetState, useUpdateEffect } from "react-use";
import { Checkbox, Icon } from "semantic-ui-react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Box, Button, Flex, Image, Spinner, Stack, Tag } from "@chakra-ui/core";

import {
  CATEGORIES,
  EDIT_IMAGE,
  IMAGES,
  REMOVE_IMAGE,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

const AdminImages: FC = () => {
  const {
    data: dataImages,
    loading: loadingDataImages,
    refetch: refetchAllImages,
  } = useQuery(IMAGES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });
  const { data: dataAllCategories } = useQuery(CATEGORIES, {
    fetchPolicy: "cache-and-network",
  });

  const [editImage, { loading: loadingEditImage }] = useMutation(EDIT_IMAGE, {
    update: (cache, { data }) => {
      if (data?.editImage) {
        cache.writeQuery({
          query: IMAGES,
          data: {
            images: data.editImage,
          },
        });
      }
    },
  });
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

  const ImageEditComponent = useCallback<
    FC<{
      _id: string;
      filename: string;
      validated: boolean;
      categories: { _id: string; name: string }[];
    }>
  >(
    ({ _id, filename, validated, categories }) => {
      const [data, setData] = useSetState({
        validated,
        categories,
      });

      const dirty =
        data.validated !== validated || data.categories !== categories;

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
              placeholder={`/api/images/${filename}`}
            >
              {(src, loading) => {
                if (loading) {
                  return <Spinner />;
                }
                return (
                  <>
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
                  </>
                );
              }}
            </LazyImage>
          </Box>
          <Flex align="center" justify="center">
            <Tag>Válido</Tag>
            <Checkbox
              toggle
              checked={data.validated}
              onChange={(_e, { checked }) => {
                if (checked !== undefined) {
                  setData({
                    validated: checked,
                  });
                }
              }}
            />
          </Flex>
          <Box width="100%" key={categories.map(({ name }) => name).join("")}>
            <Select<{ value: string; label: string }>
              value={data.categories.map(({ _id, name }) => {
                return {
                  value: _id,
                  label: name,
                };
              })}
              options={
                dataAllCategories?.categories.map(({ _id, name }) => {
                  return {
                    label: name,
                    value: _id,
                  };
                }) ?? []
              }
              isMulti
              onChange={(selected: any) => {
                const selectedCategories = (selected as {
                  label: string;
                  value: string;
                }[]).map(({ value, label }) => {
                  return {
                    _id: value,
                    name: label,
                  };
                });
                setData({
                  categories: selectedCategories,
                });
              }}
              placeholder="Seleccionar categorías"
              noOptionsMessage={() => "No hay categorías disponibles"}
            />
          </Box>
          <Box>
            <Button
              isLoading={loadingEditImage}
              onClick={() => {
                editImage({
                  variables: {
                    data: {
                      _id,
                      validated: data.validated,
                      categories: data.categories.map(({ _id }) => _id),
                    },
                  },
                });
              }}
              variantColor="blue"
              isDisabled={!dirty}
            >
              Guardar cambios
            </Button>
          </Box>
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
    },
    [
      editImage,
      removeImage,
      dataAllCategories,
      loadingEditImage,
      loadingRemoveImage,
    ]
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

      {dataImages?.images.map(image => {
        return <ImageEditComponent key={image._id} {...image} />;
      })}
    </Stack>
  );
};

export default AdminImages;
