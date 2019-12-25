import { isEqual, isEqualWith } from "lodash";
import { ChangeEvent, FC, useMemo, useState } from "react";
import Select from "react-select";
import { useDebounce, useSetState } from "react-use";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Divider,
  Input,
  InputGroup,
  InputLeftAddon,
  Spinner,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/core";

import {
  CATEGORIES,
  CREATE_TAG,
  EDIT_TAG,
  ITag,
  REMOVE_TAG,
  TAGS,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

const TagEdit: FC<ITag> = ({ _id, name, categories }) => {
  const { data: dataAllCategories, loading: loadingAllCategories } = useQuery(
    CATEGORIES,
    {
      fetchPolicy: "cache-first",
    }
  );
  const [editTag, { loading: loadingEditTag }] = useMutation(EDIT_TAG, {
    update: (cache, { data }) => {
      if (data?.editTag) {
        cache.writeQuery({
          query: TAGS,
          data: {
            tags: data.editTag,
          },
        });
      }
    },
  });
  const [removeTag, { loading: loadingRemoveTag }] = useMutation(REMOVE_TAG, {
    update: (cache, { data }) => {
      if (data?.removeTag) {
        cache.writeQuery({
          query: TAGS,
          data: {
            tags: data.removeTag,
          },
        });
      }
    },
  });
  const [data, setData] = useSetState({
    name,
    categories,
  });

  return (
    <Stack align="center" spacing="2em" p={2}>
      <InputGroup>
        <InputLeftAddon>
          <Text>Nombre etiqueta</Text>
        </InputLeftAddon>
        <Input
          value={data.name}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setData({
              name: value,
            });
          }}
        />
      </InputGroup>
      <Box
        width="100%"
        pl={10}
        pr={10}
        key={"0" + categories.map(({ name }) => name).join("")}
      >
        <Tag textAlign="center">
          <Text justifyContent="center" textAlign="center">
            Asociaciones de Categorías posibles
          </Text>
        </Tag>
        <Select<{ value: string; label: string }>
          value={data.categories.map(({ _id, name }) => {
            return {
              label: name,
              value: _id,
            };
          })}
          options={dataAllCategories?.categories.map(({ _id, name }) => {
            return {
              label: name,
              value: _id,
            };
          })}
          isMulti
          onChange={(selected: any) => {
            const selectedPossibleCategories =
              (selected as {
                label: string;
                value: string;
              }[])?.map(({ value, label }) => {
                return {
                  _id: value,
                  name: label,
                };
              }) ?? [];
            setData({
              categories: selectedPossibleCategories,
            });
          }}
          placeholder="Seleccionar posibles asociaciones de categorías"
          noOptionsMessage={() => "No hay categorías disponibles"}
        />
      </Box>

      <Box>
        <Button
          isLoading={loadingEditTag}
          onClick={() => {
            if (data.name) {
              editTag({
                variables: {
                  data: {
                    _id,
                    name: data.name,
                    categories: data.categories.map(({ _id }) => _id),
                  },
                },
              });
            } else {
              alert("Favor especificar nombre para editar una etiqueta");
            }
          }}
          variantColor="blue"
          isDisabled={isEqual(
            {
              name,
              categories,
            },
            data
          )}
        >
          Guardar cambios
        </Button>
      </Box>
      <Box>
        <Confirm
          content={`¿Está seguro que desea eliminar la etiqueta ${name}?`}
          confirmButton="Estoy seguro"
          cancelButton="Cancelar"
        >
          <Button
            variantColor="red"
            onClick={() => {
              removeTag({
                variables: {
                  data: {
                    _id,
                  },
                },
              });
            }}
            isLoading={loadingRemoveTag}
            isDisabled={loadingRemoveTag}
          >
            Eliminar etiqueta
          </Button>
        </Confirm>
      </Box>
      <Divider width="100%" borderBottom="1px solid" />
    </Stack>
  );
};

const NewTag: FC = () => {
  const [newTag, setNewTag] = useRememberState("new_tag_input", "");

  const [createTag, { loading: loadingCreateTag }] = useMutation(CREATE_TAG, {
    update: (cache, { data }) => {
      if (data?.createTag) {
        cache.writeQuery({
          query: TAGS,
          data: {
            tags: data.createTag,
          },
        });
      }
    },
  });

  return (
    <Stack align="center">
      <InputGroup>
        <InputLeftAddon>
          <Text>Etiqueta nueva</Text>
        </InputLeftAddon>
        <Input
          value={newTag}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setNewTag(value);
          }}
        />
      </InputGroup>
      <Button
        onClick={() => {
          if (newTag)
            createTag({
              variables: {
                data: {
                  name: newTag,
                },
              },
            });
        }}
        isLoading={loadingCreateTag}
        isDisabled={loadingCreateTag}
        variantColor="green"
      >
        Crear etiqueta nueva
      </Button>
    </Stack>
  );
};

const AdminTags: FC = () => {
  const { data: dataAllTags, loading: loadingAllTags } = useQuery(TAGS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <Stack align="center" pt={5}>
      <Divider borderBottom="1px solid" width="100%" />
      {loadingAllTags && <Spinner />}

      {dataAllTags?.tags.map(({ _id, name, categories }) => {
        return (
          <TagEdit
            key={_id}
            name={name}
            _id={_id}
            categories={categories.map(({ _id, name }) => ({ _id, name }))}
          />
        );
      })}

      <NewTag />
    </Stack>
  );
};

export default AdminTags;
