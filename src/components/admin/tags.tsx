import { ChangeEvent, FC, memo, useState } from "react";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/core";

import {
  CREATE_TAG,
  EDIT_TAG,
  ITag,
  REMOVE_TAG,
  TAGS,
} from "../../graphql/adminQueries";
import { usePagination } from "../../utils/pagination";
import { Confirm } from "../Confirm";

const TagEdit: FC<ITag> = ({ _id, name: nameProp }) => {
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

  const [name, setName] = useState(nameProp);

  return (
    <Stack align="center" spacing="2em" p={5} border="1px solid">
      <InputGroup>
        <InputLeftAddon>
          <Text>Nombre etiqueta</Text>
        </InputLeftAddon>
        <Input
          value={name}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setName(value);
          }}
        />
      </InputGroup>

      <Box>
        <Button
          isLoading={loadingEditTag}
          onClick={() => {
            if (name) {
              editTag({
                variables: {
                  data: {
                    _id,
                    name,
                  },
                },
              });
            } else {
              alert("Favor especificar nombre para editar una etiqueta");
            }
          }}
          variantColor="blue"
          isDisabled={name === nameProp}
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
    </Stack>
  );
};

const NewTag: FC = memo(() => {
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
});

const AdminTags: FC = () => {
  const { data: dataAllTags, loading: loadingAllTags } = useQuery(TAGS, {
    fetchPolicy: "cache-and-network",
  });

  const { selectedData, pagination } = usePagination({
    name: "admin_tags_pagination",
    data: dataAllTags?.tags,
  });

  return (
    <Stack align="center" spacing={5}>
      {loadingAllTags && <Spinner />}

      <Box p="2em">{pagination}</Box>
      {selectedData.map(({ _id, name }) => {
        return <TagEdit key={_id} name={name} _id={_id} />;
      })}
      <Box p="2em">{pagination}</Box>

      <NewTag />
    </Stack>
  );
};

export default AdminTags;
