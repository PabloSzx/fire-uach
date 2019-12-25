import { chunk, isEqual, toInteger } from "lodash";
import { ChangeEvent, FC, Fragment, useMemo, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import { useSetState } from "react-use";
import { Pagination, Table } from "semantic-ui-react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useDisclosure,
} from "@chakra-ui/core";

import { imagePlaceholder, UserType } from "../../../constants";
import {
  ALL_USERS,
  EDIT_USER,
  IMAGES,
  IUser,
  REMOVE_IMAGE,
  REMOVE_USER,
  RESET_CATEGORY_IMAGE_ASSOCIATIONS,
  RESET_TAG_CATEGORY_ASSOCIATIONS,
} from "../../graphql/adminQueries";
import { userTypeToText } from "../../utils/enums";
import { Confirm } from "../Confirm";

function defaultUserType(type?: string): UserType | undefined {
  switch (type) {
    case UserType.scientificOrAcademic:
    case UserType.professional:
    case UserType.student:
    case UserType.other:
      return type;
    default:
      return undefined;
  }
}

const UserModal: FC<IUser & { refetchAllUsers: () => Promise<any> }> = ({
  _id,
  email,
  admin,
  locked,
  type,
  typeSpecify,
  fireRelated,
  fireRelatedSpecify,
  imagesUploaded,
  tagCategoryAssociations,
  categoryImageAssociations,
  refetchAllUsers,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const [editUser, { loading: loadingEditUser }] = useMutation(EDIT_USER);
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

  const [data, setData] = useSetState({
    admin,
    locked,
    type,
    typeSpecify,
    fireRelated,
    fireRelatedSpecify,
  });

  const [
    removeImage,
    { loading: loadingRemoveImage, error: errorRemoveImage },
  ] = useMutation(REMOVE_IMAGE, {
    onCompleted: () => {
      refetchAllUsers();
    },
  });

  if (errorRemoveImage) {
    console.error(JSON.stringify(errorRemoveImage, null, 2));
  }
  const [resetCategoryImageAssociations] = useMutation(
    RESET_CATEGORY_IMAGE_ASSOCIATIONS,
    {
      onCompleted: () => {
        refetchAllUsers();
      },
    }
  );
  const [resetTagCategoryAssociations] = useMutation(
    RESET_TAG_CATEGORY_ASSOCIATIONS,
    {
      onCompleted: () => {
        refetchAllUsers();
      },
    }
  );

  const paginatedImagesUploaded = useMemo(() => {
    return chunk(imagesUploaded, 10);
  }, [imagesUploaded]);

  const [activePagination, setActivePagination] = useState(1);

  return (
    <>
      <Table.Row onClick={onOpen} className="pointer">
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>
          <Icon name={admin ? "check" : "small-close"} />
        </Table.Cell>
        <Table.Cell>{userTypeToText(type)}</Table.Cell>
        <Table.Cell>
          <Icon name={fireRelated ? "check" : "small-close"} />
        </Table.Cell>
        <Table.Cell>
          <Icon name={locked ? "lock" : "unlock"} />
        </Table.Cell>
      </Table.Row>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="80vw"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Tag variantColor="blue">{email}</Tag>
          </ModalHeader>
          <ModalCloseButton cursor="pointer" />
          <ModalBody overflowY="scroll">
            <Stack align="center">
              <Stack align="center" spacing="2em" p={2} border="1px solid">
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
                    isDisabled={
                      loadingEditUser ||
                      isEqual(
                        {
                          admin,
                          locked,
                          type,
                          typeSpecify,
                          fireRelated,
                          fireRelatedSpecify,
                        },
                        data
                      )
                    }
                    isLoading={loadingEditUser}
                    onClick={async () => {
                      await editUser({
                        variables: {
                          data: {
                            _id,
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
                    cursor="pointer"
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
                            id: _id,
                          },
                        });
                      }}
                      isLoading={loadingRemoveUser}
                      variantColor="red"
                      cursor="pointer"
                    >
                      Eliminar usuario
                    </Button>
                  </Confirm>
                </Stack>
              </Stack>
              <Stack align="center" spacing="1em">
                <Tabs
                  defaultIndex={-1}
                  variant="soft-rounded"
                  variantColor="green"
                  align="center"
                >
                  <TabList>
                    <Tab>Imágenes subidas</Tab>
                    <Tab>Asociaciones de Etiquetas - Categorías</Tab>
                    <Tab>Asociaciones de Imagenes - Categorías</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Stack align="center" textAlign="center">
                        {paginatedImagesUploaded.length === 0 ? (
                          <Text pt={3}>Sin imagenes subídas</Text>
                        ) : (
                          <Box pt={3}>
                            <Pagination
                              activePage={activePagination}
                              onPageChange={(_e, { activePage }) => {
                                setActivePagination(toInteger(activePage));
                              }}
                              totalPages={paginatedImagesUploaded.length}
                            />
                          </Box>
                        )}

                        <Box mt={3}>
                          {paginatedImagesUploaded[activePagination - 1]?.map(
                            image => {
                              return (
                                <LazyImage
                                  key={image._id}
                                  src={`/api/images/${image.filename}`}
                                  placeholder={imagePlaceholder}
                                >
                                  {(src, loading) => {
                                    return (
                                      <Stack
                                        align="center"
                                        mt={3}
                                        border="1px solid"
                                        p={3}
                                      >
                                        {loading && <Spinner />}
                                        <Image
                                          src={src}
                                          w="100%"
                                          h="100%"
                                          objectFit="contain"
                                          maxH="30vh"
                                          maxW="70vw"
                                        />
                                        <Confirm
                                          header={`¿Estás seguro que quieres eliminar la imagen ${image.filename}?`}
                                          content="Será eliminada permanentemente"
                                          confirmButton="Estoy seguro"
                                          cancelButton="Cancelar"
                                        >
                                          <Button
                                            variantColor="red"
                                            cursor="pointer"
                                            onClick={async () => {
                                              await removeImage({
                                                variables: {
                                                  data: {
                                                    _id: image._id,
                                                  },
                                                },
                                              });
                                            }}
                                          >
                                            Eliminar imagen
                                          </Button>
                                        </Confirm>
                                      </Stack>
                                    );
                                  }}
                                </LazyImage>
                              );
                            }
                          )}
                        </Box>
                      </Stack>
                    </TabPanel>
                    <TabPanel>
                      <Stack spacing="2em" align="center">
                        {tagCategoryAssociations.length === 0 ? (
                          <Text pt={3}>Sin asociaciones realizadas</Text>
                        ) : (
                          <Confirm
                            content={`Todos las asociaciones de etiqueta del usuario ${email} serán eliminadas`}
                            header="¿Estás seguro que deseas eliminar todas las asociaciones de etiqueta de este usuario?"
                            confirmButton="Estoy seguro"
                            cancelButton="Cancelar"
                          >
                            <Stack
                              align="center"
                              cursor="pointer"
                              border="1px solid"
                              mt={3}
                              p={2}
                              onClick={async () => {
                                await resetTagCategoryAssociations({
                                  variables: {
                                    user: _id,
                                  },
                                });
                              }}
                            >
                              <IconButton
                                icon="delete"
                                aria-label="Reset tag category associations"
                              />
                              <Text>
                                Resetear asociaciones de etiqueta - categoría
                              </Text>
                            </Stack>
                          </Confirm>
                        )}
                        {tagCategoryAssociations.map((tagAssoc, key) => {
                          return (
                            <Fragment key={tagAssoc._id}>
                              {key !== 0 && (
                                <Divider
                                  width="100%"
                                  borderBottom="1px solid"
                                />
                              )}
                              {tagAssoc.tag && (
                                <Stack align="center">
                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Tag:</Tag>
                                    <Tag ml={1} variantColor="blue">
                                      {tagAssoc.tag.name}
                                    </Tag>
                                  </Flex>
                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Eligió categorías:</Tag>
                                    {!tagAssoc.categoriesChosen ? (
                                      <Tag ml={1} variantColor="gray">
                                        Ninguno
                                      </Tag>
                                    ) : (
                                      tagAssoc.categoriesChosen.map(tag => {
                                        return (
                                          <Tag
                                            key={tag._id}
                                            ml={1}
                                            variantColor="green"
                                          >
                                            {tag.name}
                                          </Tag>
                                        );
                                      })
                                    )}
                                  </Flex>

                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Rechazó:</Tag>
                                    {tagAssoc.rejectedCategories.map(
                                      category => {
                                        return (
                                          <Tag
                                            key={category._id}
                                            m={1}
                                            variantColor="yellow"
                                          >
                                            {category.name}
                                          </Tag>
                                        );
                                      }
                                    )}
                                  </Flex>
                                </Stack>
                              )}
                            </Fragment>
                          );
                        })}
                      </Stack>
                    </TabPanel>
                    <TabPanel>
                      <Stack spacing="2em" align="center">
                        {categoryImageAssociations.length === 0 ? (
                          <Text pt={3}>Sin asociaciones realizadas</Text>
                        ) : (
                          <Confirm
                            content={`Todos las asociaciones de imagen del usuario ${email} serán eliminadas`}
                            header="¿Estás seguro que deseas eliminar todas las asociaciones de imagen de este usuario?"
                            confirmButton="Estoy seguro"
                            cancelButton="Cancelar"
                          >
                            <Stack
                              align="center"
                              cursor="pointer"
                              border="1px solid"
                              mt={3}
                              p={2}
                              onClick={async () => {
                                await resetCategoryImageAssociations({
                                  variables: {
                                    user: _id,
                                  },
                                });
                              }}
                            >
                              <IconButton
                                icon="delete"
                                aria-label="Reset category image associations"
                              />
                              <Text>
                                Resetear asociaciones de imagen - categoría
                              </Text>
                            </Stack>
                          </Confirm>
                        )}
                        {categoryImageAssociations.map((catImgAssoc, key) => {
                          return (
                            <Fragment key={catImgAssoc._id}>
                              {key !== 0 && (
                                <Divider
                                  borderBottom="1px solid"
                                  width="100%"
                                />
                              )}
                              {catImgAssoc.image && (
                                <Stack align="center" pt={3}>
                                  <LazyImage
                                    placeholder={imagePlaceholder}
                                    src={`/api/images/${catImgAssoc.image.filename}`}
                                  >
                                    {(src, loading) => {
                                      return (
                                        <Stack align="center">
                                          {loading && <Spinner />}
                                          <Image
                                            src={src}
                                            w="100%"
                                            h="100%"
                                            maxH="15vh"
                                            maxW="50vw"
                                            alt={catImgAssoc.image?.filename}
                                            objectFit="contain"
                                          />
                                        </Stack>
                                      );
                                    }}
                                  </LazyImage>
                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Eligió categorías:</Tag>
                                    {!catImgAssoc.categoriesChosen ? (
                                      <Tag ml={1} variantColor="gray">
                                        Ninguno
                                      </Tag>
                                    ) : (
                                      catImgAssoc.categoriesChosen.map(
                                        category => {
                                          return (
                                            <Tag
                                              key={category._id}
                                              ml={1}
                                              variantColor="green"
                                            >
                                              {category.name}
                                            </Tag>
                                          );
                                        }
                                      )
                                    )}
                                  </Flex>

                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Rechazó:</Tag>
                                    {catImgAssoc.rejectedCategories.map(
                                      category => {
                                        return (
                                          <Tag
                                            key={category._id}
                                            m={1}
                                            variantColor="yellow"
                                          >
                                            {category.name}
                                          </Tag>
                                        );
                                      }
                                    )}
                                  </Flex>
                                </Stack>
                              )}
                            </Fragment>
                          );
                        })}
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              variantColor="blue"
              mr={3}
              cursor="pointer"
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const AdminUsers: FC = () => {
  const {
    data: dataAllUsers,
    loading: loadingAllUsers,
    refetch: refetchAllUsers,
    error: errorAllUsers,
  } = useQuery(ALL_USERS, {
    fetchPolicy: "cache-and-network",
  });

  if (errorAllUsers) {
    console.error(JSON.stringify(errorAllUsers, null, 2));
  }

  return (
    <Stack pt={5} align="center">
      {loadingAllUsers && <Spinner />}

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Admin</Table.HeaderCell>
            <Table.HeaderCell>Tipo</Table.HeaderCell>
            <Table.HeaderCell>Relacionado con el fuego</Table.HeaderCell>
            <Table.HeaderCell>Bloqueado</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {dataAllUsers?.allUsers.map(user => {
            return (
              <UserModal
                key={user._id}
                {...user}
                refetchAllUsers={refetchAllUsers}
              />
            );
          })}
        </Table.Body>
      </Table>
    </Stack>
  );
};

export default AdminUsers;
