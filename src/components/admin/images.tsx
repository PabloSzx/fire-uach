import { chunk, isEqual, toInteger } from "lodash";
import { FC, useMemo } from "react";
import LazyImage from "react-lazy-progressive-image";
import Select from "react-select";
import { useSetState } from "react-use";
import { Checkbox, Icon, Pagination } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import { Box, Button, Flex, Image, Spinner, Stack, Tag } from "@chakra-ui/core";

import { imagePlaceholder } from "../../../constants";
import {
  CATEGORIES,
  EDIT_IMAGE,
  IImage,
  IMAGES,
  REMOVE_IMAGE,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

const ImageEdit: FC<IImage> = ({
  _id,
  filename,
  uploader,
  validated,
  categories,
}) => {
  const { data: dataAllCategories } = useQuery(CATEGORIES);

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

  const [data, setData] = useSetState({
    filename,
    validated,
    categories,
  });

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
          isDisabled={
            loadingEditImage ||
            isEqual(data, {
              filename,
              validated,
              categories,
            })
          }
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
