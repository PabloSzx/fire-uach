import { FC } from "react";
import LazyLoad from "react-lazyload";
import Select from "react-select";
import { Checkbox } from "semantic-ui-react";

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
  const { data: dataImages, loading: loadingDataImages } = useQuery(IMAGES);
  const { data: dataAllCategories } = useQuery(CATEGORIES);

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
  return (
    <Stack pt={5} spacing="2em">
      {loadingDataImages && <Spinner />}
      {dataImages?.images.map(({ _id, filename, validated, categories }) => {
        const data = {
          _id,
          validated,
          categories: [...categories],
        };
        return (
          <Stack
            dir="column"
            display="flex"
            p={2}
            border="1px solid"
            key={_id}
            textAlign="center"
            justifyContent="center"
            align="center"
          >
            <Box>
              <LazyLoad height={300} once>
                <Image
                  pos="relative"
                  w="100%"
                  h="100%"
                  maxH="40vh"
                  maxW="70vw"
                  objectFit="contain"
                  src={`/api/images/${filename}`}
                />
              </LazyLoad>
            </Box>
            <Flex align="center" justify="center">
              <Tag>Válido</Tag>
              <Checkbox
                toggle
                defaultChecked={validated}
                onChange={(_e, { checked }) => {
                  if (checked !== undefined) data.validated = checked;
                }}
              />
            </Flex>
            <Box width="100%" key={categories.map(({ name }) => name).join("")}>
              <Select<{ value: string; label: string }>
                defaultValue={categories.map(({ _id, name }) => {
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
                  data.categories = selectedCategories;
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
                        _id: data._id,
                        validated: data.validated,
                        categories: data.categories.map(({ _id }) => _id),
                      },
                    },
                  });
                }}
                variantColor="blue"
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
      })}
    </Stack>
  );
};

export default AdminImages;
