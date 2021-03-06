import { format } from "date-fns";
import esLocale from "date-fns/locale/es";
import { compact, toInteger, uniq } from "lodash";
import { FC, memo, useMemo, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import Select from "react-select";
import { Checkbox, Icon, Input } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";
import wait from "waait";

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

import { imagePlaceholder } from "../../../constants";
import {
  EDIT_IMAGE,
  IImage,
  IMAGES,
  REMOVE_IMAGE,
} from "../../graphql/adminQueries";
import { usePaginationAllData } from "../../utils/pagination";
import { Confirm } from "../Confirm";

const ImageEdit: FC<IImage & { maxImageHeight: number }> = memo(
  ({ maxImageHeight, _id, filename, uploader, validated, uploadedAt }) => {
    const [editImage] = useMutation(EDIT_IMAGE);
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
                    maxH={`${maxImageHeight}vh`}
                    // maxW="40vw"
                    objectFit="contain"
                    src={src}
                  />
                </Stack>
              );
            }}
          </LazyImage>
        </Box>
        {maxImageHeight >= 10 && (
          <>
            {uploader?.email && (
              <Box>
                <Tag>Subido por:</Tag>

                <Tag variantColor="blue">{uploader?.email}</Tag>
              </Box>
            )}

            <Box>
              <Tag>Fecha subida:</Tag>

              <Tag variantColor="blue">
                {format(new Date(uploadedAt), "PPPPpppp", {
                  locale: esLocale,
                })}
              </Tag>
            </Box>

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
                  cursor="pointer"
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
          </>
        )}
      </Stack>
    );
  }
);

const AdminImages: FC = () => {
  const {
    data: dataImages,
    loading: loadingDataImages,
    refetch: refetchAllImages,
  } = useQuery(IMAGES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const users = useMemo(() => {
    return uniq(
      compact(
        dataImages?.images.map(({ uploader }) => {
          return uploader?.email;
        })
      )
    );
  }, [dataImages]);

  const [selectedUsers, setSelectedUsers] = useRememberState<
    {
      label: string;
      value: string;
    }[]
  >("selectedUsersImagesFilter", []);

  const [typeFilter, setTypeFilter] = useRememberState<
    | {
        label: "Solo vista pública activada";
        value: "onlyPublic";
      }
    | {
        label: "Solo vista publica desactivada";
        value: "onlyPrivate";
      }
    | {
        label: "Sin filtrar";
        value: "any";
      }
  >("imagesTypeFilter", {
    label: "Sin filtrar",
    value: "any",
  });

  const filteredImages = useMemo(() => {
    const selectedUsersMap = selectedUsers.reduce<Record<string, boolean>>(
      (acum, { value }) => {
        acum[value] = true;
        return acum;
      },
      {}
    );
    return (
      dataImages?.images.filter(image => {
        if (selectedUsers.length > 0) {
          if (!image.uploader || !selectedUsersMap[image.uploader.email]) {
            return false;
          }
        }
        if (typeFilter.value !== "any") {
          if (typeFilter.value === "onlyPrivate") {
            if (image.validated) {
              return false;
            }
          } else {
            if (!image.validated) {
              return false;
            }
          }
        }
        return true;
      }) ?? []
    );
  }, [dataImages, selectedUsers, typeFilter]);

  const [nPagination, setNPagination] = useState(10);

  const [maxImageHeight, setMaxImageHeight] = useState(20);

  const { pagination, selectedData } = usePaginationAllData({
    name: "admin_images_pagination",
    data: filteredImages,
    n: nPagination,
  });

  return (
    <Stack pt={5} spacing="2em" align="center" alignItems="center">
      {loadingDataImages ? (
        <Spinner />
      ) : (
        <Box cursor="pointer">
          <Icon
            name="repeat"
            onClick={() => {
              refetchAllImages();
            }}
          />
        </Box>
      )}

      <Box width="100%" textAlign="center">
        <Input
          label="Número de imágenes por página"
          value={nPagination}
          onChange={(_, { value }) => {
            const n = toInteger(value);
            setNPagination(n > 1 ? n : 1);
          }}
        />
      </Box>

      <Box width="100%" textAlign="center">
        <Input
          label="Altura máxima por imagen"
          value={maxImageHeight}
          onChange={(_, { value }) => {
            const n = toInteger(value);
            if (n < 0) {
              setMaxImageHeight(0);
            } else if (n > 100) {
              setMaxImageHeight(100);
            } else {
              setMaxImageHeight(n);
            }
          }}
        />
      </Box>

      <Box width="100%">
        <Text>Filtrar por usuario</Text>
        <Select
          options={users.map(value => ({
            label: value,
            value,
          }))}
          isMulti
          onChange={(selected: any) => {
            setSelectedUsers(
              (selected as { label: string; value: string }[]) || []
            );
          }}
          value={selectedUsers}
          placeholder="Seleccionar usuarios"
        />
      </Box>
      <Box width="100%">
        <Text>Filtrar por vista pública</Text>
        <Select<
          | {
              label: "Solo vista pública activada";
              value: "onlyPublic";
            }
          | {
              label: "Solo vista publica desactivada";
              value: "onlyPrivate";
            }
          | {
              label: "Sin filtrar";
              value: "any";
            }
        >
          options={[
            {
              label: "Solo vista pública activada",
              value: "onlyPublic",
            },
            {
              label: "Solo vista publica desactivada",
              value: "onlyPrivate",
            },
            {
              label: "Sin filtrar",
              value: "any",
            },
          ]}
          onChange={selected => {
            setTypeFilter(selected as any);
          }}
          value={typeFilter}
        />
      </Box>

      {pagination}

      <Box mt={3} mb={3}>
        {selectedData.map(image => {
          return (
            <ImageEdit
              key={image._id}
              {...image}
              maxImageHeight={maxImageHeight}
            />
          );
        })}
      </Box>

      {pagination}
    </Stack>
  );
};

export default AdminImages;
