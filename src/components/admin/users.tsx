import { isEqual } from "lodash";
import { ChangeEvent, FC, useCallback } from "react";
import { useSetState } from "react-use";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tag,
} from "@chakra-ui/core";

import { UserType } from "../../../constants";
import {
  ALL_USERS,
  EDIT_USER,
  IUser,
  REMOVE_USER,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

function defaultUserType(type: string): UserType {
  switch (type) {
    case UserType.scientificOrAcademic:
    case UserType.professional:
    case UserType.student:
      return type;
    default:
      return UserType.other;
  }
}

const AdminUsers: FC = () => {
  const { data: dataAllUsers } = useQuery(ALL_USERS);
  const [editUser, { loading: loadingEditUser, error }] = useMutation(
    EDIT_USER
  );
  const [removeUser, { loading: loadingRemoveUser }] = useMutation(
    REMOVE_USER,
    {
      update: (cache, { data }) => {
        if (data?.removeUser) {
          cache.writeQuery({
            query: ALL_USERS,
            data: {
              images: data.removeUser,
            },
          });
        }
      },
    }
  );

  if (error) {
    console.error(JSON.stringify(error, null, 2));
  }
  const EditUserComponent = useCallback<FC<IUser>>(
    userProp => {
      const [data, setData] = useSetState(userProp);
      return (
        <Stack mt={3} align="center" spacing="2em" p={2} border="1px solid">
          <Box>
            <Tag variantColor="blue">{data.email}</Tag>
          </Box>
          <Box>
            <Checkbox
              borderColor="grey"
              isChecked={data.admin}
              onChange={() => {
                setData(({ admin }) => ({
                  admin: !admin,
                }));
              }}
            >
              Admin
            </Checkbox>
          </Box>
          <Box>
            <Checkbox
              borderColor="grey"
              isChecked={data.locked}
              onChange={() => {
                setData(({ locked }) => ({
                  locked: !locked,
                }));
              }}
            >
              Bloqueado
            </Checkbox>
          </Box>
          <Box>
            <Heading as="h2" size="lg">
              Tipo de usuario
            </Heading>
            <RadioGroup
              value={data.type}
              onChange={({ target: { value } }) => {
                setData({
                  type: defaultUserType(value),
                });
              }}
            >
              <Radio
                variantColor="green"
                value={UserType.scientificOrAcademic}
                aria-label="scientific"
                borderColor="grey"
              >
                Científic@ y/o académic@
              </Radio>
              <Radio
                variantColor="green"
                value={UserType.professional}
                borderColor="grey"
              >
                Profesional
              </Radio>
              <Radio
                variantColor="green"
                value={UserType.student}
                borderColor="grey"
              >
                Estudiante
              </Radio>
              <Radio
                variantColor="green"
                value={UserType.other}
                borderColor="grey"
              >
                Otros
              </Radio>
            </RadioGroup>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>Especificación tipo</FormLabel>
              <Input
                type="text"
                value={data.typeSpecify}
                onChange={({
                  target: { value },
                }: ChangeEvent<HTMLInputElement>) => {
                  setData({
                    typeSpecify: value,
                  });
                }}
              />
            </FormControl>
          </Box>
          <Box>
            <Checkbox
              borderColor="grey"
              isChecked={data.fireRelated}
              onChange={() => {
                setData(({ fireRelated }) => ({
                  fireRelated: !fireRelated,
                }));
              }}
            >
              Relacionado al fuego
            </Checkbox>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>Especificación relacionado al fuego</FormLabel>
              <Input
                type="text"
                value={data.fireRelatedSpecify}
                onChange={({
                  target: { value },
                }: ChangeEvent<HTMLInputElement>) => {
                  setData({
                    fireRelatedSpecify: value,
                  });
                }}
              />
            </FormControl>
          </Box>
          <Stack>
            <Button
              isDisabled={loadingEditUser || isEqual(userProp, data)}
              isLoading={loadingEditUser}
              onClick={async () => {
                await editUser({
                  variables: {
                    data: {
                      _id: userProp._id,
                      admin: data.admin,
                      type: data.type,
                      typeSpecify: data.typeSpecify,
                      fireRelated: data.fireRelated,
                      fireRelatedSpecify: data.fireRelatedSpecify,
                      locked: data.locked,
                    },
                  },
                });
              }}
              variantColor="green"
            >
              Guardar cambios
            </Button>
            <Confirm
              header="¿Está seguro que desea eliminar este usuario?"
              content="Siempre es preferible bloquear un usuario antes que eliminarlo"
              cancelButton="Cancelar"
              confirmButton="Estoy seguro"
            >
              <Button
                onClick={async () => {
                  await removeUser({
                    variables: {
                      id: userProp._id,
                    },
                  });
                }}
                isLoading={loadingRemoveUser}
                variantColor="red"
              >
                Eliminar usuario
              </Button>
            </Confirm>
          </Stack>
        </Stack>
      );
    },
    [editUser, removeUser, loadingEditUser, loadingRemoveUser]
  );
  return (
    <Stack pt={5}>
      {dataAllUsers?.allUsers.map(user => {
        return <EditUserComponent key={user._id} {...user} />;
      })}
    </Stack>
  );
};

export default AdminUsers;
