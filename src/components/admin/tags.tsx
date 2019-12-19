import { intersectionBy } from "lodash";
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
  CREATE_TAG,
  EDIT_TAG,
  REMOVE_TAG,
  TAGS,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

const AdminTags: FC = () => {
  const { data: dataAllTags, loading: loadingAllTags } = useQuery(TAGS, {
    fetchPolicy: "cache-and-network",
  });

  const [newTag, setNewTag] = useRememberState("new_tag_input", "");

  const disabledNewTag = useMemo(() => {
    return (
      (dataAllTags?.tags.findIndex(tag => {
        return tag.name === newTag;
      }) ?? -1) !== -1
    );
  }, [newTag, dataAllTags]);

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

  const EditTagComponent = useCallback<
    FC<{
      _id: string;
      name: string;
      possibleTagAssociations: { _id: string; name: string }[];
      correctTagAssociations: { _id: string; name: string }[];
    }>
  >(
    ({ _id, name, possibleTagAssociations, correctTagAssociations }) => {
      const [data, setData] = useSetState({
        name,
        possibleTagAssociations: [...possibleTagAssociations],
        correctTagAssociations: [...correctTagAssociations],
      });

      const correctTagsAssociationsFiltered = useMemo(() => {
        return intersectionBy(
          data.correctTagAssociations,
          data.possibleTagAssociations,
          ({ _id }) => _id
        );
      }, [data.correctTagAssociations, data.possibleTagAssociations]);

      return (
        <Stack align="center" spacing="2em" p={2}>
          <InputGroup>
            <InputLeftAddon>
              <Text>Nombre tag</Text>
            </InputLeftAddon>
            <Input
              value={data.name}
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
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
            key={"0" + possibleTagAssociations.map(({ name }) => name).join("")}
          >
            <Tag textAlign="center">
              <Text justifyContent="center" textAlign="center">
                Asociaciones de Tags posibles
              </Text>
            </Tag>
            <Select<{ value: string; label: string }>
              value={data.possibleTagAssociations.map(({ _id, name }) => {
                return {
                  label: name,
                  value: _id,
                };
              })}
              options={dataAllTags?.tags
                .map(({ _id, name }) => {
                  return {
                    label: name,
                    value: _id,
                  };
                })
                .filter(({ value }) => {
                  return value !== _id;
                })}
              isMulti
              onChange={(selected: any) => {
                const selectedPossibleTags =
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
                  possibleTagAssociations: selectedPossibleTags,
                });
              }}
              placeholder="Seleccionar posibles asociaciones de tag"
              noOptionsMessage={() => "No hay tags disponibles"}
            />
          </Box>
          <Box
            width="100%"
            pl={10}
            pr={10}
            key={"1" + correctTagAssociations.map(({ name }) => name).join("")}
          >
            <Tag textAlign="center">
              <Text justifyContent="center" textAlign="center">
                Asociaciones de Tags correctas
              </Text>
            </Tag>
            <Select<{ value: string; label: string }>
              value={correctTagsAssociationsFiltered.map(({ _id, name }) => {
                return {
                  label: name,
                  value: _id,
                };
              })}
              options={data.possibleTagAssociations
                .map(({ _id, name }) => {
                  return {
                    label: name,
                    value: _id,
                  };
                })
                .filter(({ value }) => {
                  return value !== _id;
                })}
              isMulti
              onChange={(selected: any) => {
                const selectedCorrectTags =
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
                  correctTagAssociations: selectedCorrectTags,
                });
              }}
              placeholder="Seleccionar asociaciones de tag correctas"
              noOptionsMessage={() => "No hay tags disponibles"}
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
                        possibleTagAssociations: data.possibleTagAssociations.map(
                          ({ _id }) => {
                            return _id;
                          }
                        ),
                        correctTagAssociations: correctTagsAssociationsFiltered.map(
                          ({ _id }) => {
                            return _id;
                          }
                        ),
                      },
                    },
                  });
                } else {
                  alert("Favor especificar nombre para editar un tag");
                }
              }}
              variantColor="blue"
            >
              Guardar cambios
            </Button>
          </Box>
          <Box>
            <Confirm
              content={`¿Está seguro que desea eliminar el tag ${name}?`}
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
                Eliminar tag
              </Button>
            </Confirm>
          </Box>
          <Divider width="100vw" />
        </Stack>
      );
    },
    [removeTag, editTag, loadingRemoveTag, loadingEditTag, dataAllTags]
  );
  return (
    <Stack align="center" pt={5}>
      <Divider border="1px solid" width="100vw" />
      {loadingAllTags && <Spinner />}

      {dataAllTags?.tags.map(tag => {
        return <EditTagComponent key={tag._id} {...tag} />;
      })}
      <Stack align="center">
        <InputGroup>
          <InputLeftAddon>
            <Text>Tag nuevo</Text>
          </InputLeftAddon>
          <Input
            value={newTag}
            onChange={({
              target: { value },
            }: ChangeEvent<HTMLInputElement>) => {
              setNewTag(value);
            }}
          />
        </InputGroup>
        <Button
          isLoading={loadingCreateTag}
          isDisabled={!newTag || disabledNewTag}
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
          variantColor="green"
        >
          Crear tag nuevo
        </Button>
      </Stack>
    </Stack>
  );
};

export default AdminTags;
