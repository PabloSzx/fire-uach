import { intersectionBy, isEqual } from "lodash";
import { ChangeEvent, FC, useCallback, useMemo } from "react";
import Select from "react-select";
import { useSetState } from "react-use";
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
  CREATE_CATEGORY,
  EDIT_CATEGORY,
  REMOVE_CATEGORY,
  TAGS,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

const AdminCategories: FC = () => {
  const { data: dataAllCategories, loading: loadingAllCategories } = useQuery(
    CATEGORIES,
    {
      fetchPolicy: "cache-and-network",
    }
  );
  const { data: dataAllTags } = useQuery(TAGS, {
    fetchPolicy: "cache-and-network",
  });

  const [newCategory, setNewCategory] = useRememberState(
    "create_category_input",
    ""
  );

  const disabledNewCategory = useMemo(() => {
    return (
      (dataAllCategories?.categories.findIndex(category => {
        return category.name === newCategory;
      }) ?? -1) !== -1
    );
  }, [newCategory, dataAllCategories]);

  const [createCategory, { loading: loadingNewCategory }] = useMutation(
    CREATE_CATEGORY,
    {
      update: (cache, { data }) => {
        if (data?.createCategory) {
          cache.writeQuery({
            query: CATEGORIES,
            data: {
              categories: data.createCategory,
            },
          });
        }
      },
    }
  );
  const [editCategory, { loading: loadingEditCategory }] = useMutation(
    EDIT_CATEGORY
  );
  const [removeCategory, { loading: loadingRemoveCategory }] = useMutation(
    REMOVE_CATEGORY,
    {
      update: (cache, { data }) => {
        if (data?.removeCategory) {
          cache.writeQuery({
            query: CATEGORIES,
            data: {
              categories: data.removeCategory,
            },
          });
        }
      },
    }
  );

  const EditCategoryComponent = useCallback<
    FC<{
      _id: string;
      name: string;
      tags: { _id: string; name: string }[];
    }>
  >(
    ({ _id, ...categoryProp }) => {
      const [data, setData] = useSetState(categoryProp);

      return (
        <Stack key={_id} align="center" spacing="2em" p={2}>
          <InputGroup>
            <InputLeftAddon>
              <Text>Nombre Categoría</Text>
            </InputLeftAddon>
            <Input
              value={data.name}
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                setData({ name: value });
              }}
            />
          </InputGroup>
          <Box
            width="100%"
            pl={10}
            pr={10}
            key={"0" + categoryProp.tags.map(({ name }) => name).join("")}
          >
            <Tag>
              <Text>Etiquetas posibles</Text>
            </Tag>
            <Select<{ value: string; label: string }>
              value={data.tags.map(({ _id, name }) => {
                return {
                  label: name,
                  value: _id,
                };
              })}
              options={dataAllTags?.tags.map(({ _id, name }) => {
                return {
                  label: name,
                  value: _id,
                };
              })}
              isMulti
              onChange={(selected: any) => {
                const selectedTags =
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
                  tags: selectedTags,
                });
              }}
              placeholder="Seleccionar posibles etiquetas"
              noOptionsMessage={() => "No hay etiquetas disponibles"}
            />
          </Box>

          <Box>
            <Button
              isLoading={loadingEditCategory}
              onClick={() => {
                if (data.name) {
                  editCategory({
                    variables: {
                      data: {
                        _id,
                        name: data.name,
                        tags: data.tags.map(({ _id }) => {
                          return _id;
                        }),
                      },
                    },
                  });
                } else {
                  alert("Favor especificar nombre para editar una categoría");
                }
              }}
              variantColor="blue"
              isDisabled={loadingEditCategory || isEqual(categoryProp, data)}
            >
              Guardar cambios
            </Button>
          </Box>
          <Box>
            <Confirm
              content={`¿Está seguro que desea eliminar la categoría ${name}?`}
              confirmButton="Estoy seguro"
              cancelButton="Cancelar"
            >
              <Button
                variantColor="red"
                onClick={() => {
                  removeCategory({
                    variables: {
                      data: {
                        _id,
                      },
                    },
                  });
                }}
                isLoading={loadingRemoveCategory}
                isDisabled={loadingRemoveCategory}
              >
                Eliminar categoría
              </Button>
            </Confirm>
          </Box>

          <Divider width="100vw" />
        </Stack>
      );
    },
    [
      editCategory,
      dataAllTags,
      removeCategory,
      loadingRemoveCategory,
      loadingEditCategory,
    ]
  );

  return (
    <Stack align="center" pt={5}>
      <Divider border="1px solid" width="100vw" />

      {loadingAllCategories && <Spinner />}
      {dataAllCategories?.categories.map(category => {
        return <EditCategoryComponent key={category._id} {...category} />;
      })}
      <Stack align="center">
        <InputGroup>
          <InputLeftAddon>
            <Text>Categoría nueva</Text>
          </InputLeftAddon>
          <Input
            value={newCategory}
            onChange={({
              target: { value },
            }: ChangeEvent<HTMLInputElement>) => {
              setNewCategory(value);
            }}
          />
        </InputGroup>
        <Button
          isLoading={loadingNewCategory}
          isDisabled={!newCategory || disabledNewCategory}
          onClick={() => {
            if (newCategory)
              createCategory({
                variables: {
                  data: {
                    name: newCategory,
                  },
                },
              });
          }}
          variantColor="green"
        >
          Crear categoría nueva
        </Button>
      </Stack>
    </Stack>
  );
};

export default AdminCategories;
