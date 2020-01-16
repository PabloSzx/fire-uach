import { ChangeEvent, FC, useMemo, useState } from "react";
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
  CATEGORIES,
  CREATE_CATEGORY,
  EDIT_CATEGORY,
  REMOVE_CATEGORY,
} from "../../graphql/adminQueries";
import { usePagination } from "../../utils/pagination";
import { Confirm } from "../Confirm";

const EditCategory: FC<{ _id: string; name: string }> = ({ _id, name }) => {
  const [dataName, setDataName] = useState(name);
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

  return (
    <Stack align="center" spacing="2em" p={5} border="1px solid">
      <InputGroup>
        <InputLeftAddon>
          <Text>Nombre Categoría</Text>
        </InputLeftAddon>
        <Input
          value={dataName}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setDataName(value);
          }}
        />
      </InputGroup>

      <Box>
        <Button
          isLoading={loadingEditCategory}
          onClick={() => {
            if (dataName) {
              editCategory({
                variables: {
                  data: {
                    _id,
                    name: dataName,
                  },
                },
              });
            } else {
              alert("Favor especificar nombre para editar una categoría");
            }
          }}
          variantColor="blue"
          isDisabled={loadingEditCategory || dataName === name}
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
    </Stack>
  );
};

const AdminCategories: FC = () => {
  const { data: dataAllCategories, loading: loadingAllCategories } = useQuery(
    CATEGORIES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

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

  const { selectedData, pagination } = usePagination({
    name: "admin_categories_pagination",
    data: dataAllCategories?.categories,
  });

  return (
    <Stack align="center">
      {loadingAllCategories && <Spinner />}
      <Box p="2em">{pagination}</Box>
      {selectedData.map(category => {
        return <EditCategory key={category._id} {...category} />;
      })}
      <Box p="2em">{pagination}</Box>
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
