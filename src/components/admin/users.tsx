import { format } from "date-fns";
import esLocale from "date-fns/locale/es";
import { isEqual } from "lodash";
import { ChangeEvent, FC, Fragment } from "react";
import LazyImage from "react-lazy-progressive-image";
import { useSetState } from "react-use";
import { Icon as SemanticIcon, Table } from "semantic-ui-react";

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
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
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
import { userTypeToText } from "../../../constants/enums";
import {
  ALL_USERS,
  EDIT_USER,
  IUser,
  REMOVE_IMAGE,
  REMOVE_USER,
  RESET_CATEGORY_IMAGE_ASSOCIATIONS,
  RESET_TAG_CATEGORY_ASSOCIATIONS,
  USER_STATS,
} from "../../graphql/adminQueries";
import { usePagination } from "../../utils/pagination";
import { Confirm } from "../Confirm";

function defaultUserType(type?: string): UserType | undefined {
  switch (type) {
    case UserType.scientificOrAcademic:
    case UserType.technicianOrProfessional:
    case UserType.student:
    case UserType.other:
    case UserType.corralHabitant:
    case UserType.villaAlemanaHabitant:
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
  types,
  typeSpecify,
  fireRelated,
  fireRelatedSpecify,
  imagesUploaded,
  tagCategoryAssociations,
  categoryImageAssociations,
  refetchAllUsers,
  readTips,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  const { data: dataUserStats, refetch: refetchStats } = useQuery(USER_STATS, {
    variables: {
      _id,
    },
    fetchPolicy: "cache-and-network",
    skip: !isOpen,
  });

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
    types,
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
      refetchStats();
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
        refetchStats();
      },
    }
  );
  const [resetTagCategoryAssociations] = useMutation(
    RESET_TAG_CATEGORY_ASSOCIATIONS,
    {
      onCompleted: () => {
        refetchAllUsers();
        refetchStats();
      },
    }
  );

  const { pagination, selectedData, paginatedData } = usePagination({
    name: "admin_users_pagination",
    data: imagesUploaded,
  });

  const TypeCheckbox: FC<{ children: UserType }> = ({
    children: typeCheck,
  }) => {
    return (
      <Checkbox
        isChecked={data.types.includes(typeCheck)}
        onChange={() => {
          if (data.types.includes(typeCheck)) {
            setData({
              types: data.types.filter(type => type !== typeCheck),
            });
          } else {
            setData({
              types: [...data.types, typeCheck],
            });
          }
        }}
        variantColor="green"
        aria-label={typeCheck}
        borderColor="grey"
      >
        {userTypeToText(typeCheck)}
      </Checkbox>
    );
  };

  return (
    <>
      <Table.Row onClick={onOpen} className="pointer">
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>
          <Icon name={admin ? "check" : "small-close"} />
        </Table.Cell>
        <Table.Cell>
          {types?.map(type => userTypeToText(type).slice(0, 5)).join("|")}
        </Table.Cell>
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
        blockScrollOnMount={false}
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
                  <Stack>
                    <TypeCheckbox>{UserType.scientificOrAcademic}</TypeCheckbox>
                    <TypeCheckbox>
                      {UserType.technicianOrProfessional}
                    </TypeCheckbox>
                    <TypeCheckbox>{UserType.student}</TypeCheckbox>
                    <TypeCheckbox>{UserType.corralHabitant}</TypeCheckbox>
                    <TypeCheckbox>{UserType.villaAlemanaHabitant}</TypeCheckbox>
                    <TypeCheckbox>{UserType.other}</TypeCheckbox>
                  </Stack>
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
                          types,
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
                            types: data.types,
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
                {dataUserStats?.userStats ? (
                  <StatGroup
                    border="1px solid"
                    textAlign="center"
                    alignItems="center"
                  >
                    <Stat p={0} m={4}>
                      <StatLabel>Imágenes asociadas</StatLabel>
                      <StatNumber>
                        {dataUserStats.userStats.nAssociatedImages}
                      </StatNumber>
                    </Stat>

                    <Stat p={0} m={4}>
                      <StatLabel>Etiquetas asociadas</StatLabel>
                      <StatNumber>
                        {dataUserStats.userStats.nAssociatedTags}
                      </StatNumber>
                    </Stat>
                    <Stat p={0} m={4}>
                      <StatLabel>Imágenes subidas</StatLabel>
                      <StatNumber>
                        {dataUserStats.userStats.nUploadedImages}
                      </StatNumber>
                    </Stat>
                    <Stat p={0} m={4}>
                      <StatLabel>Imágenes validadas</StatLabel>
                      <StatNumber>
                        {dataUserStats.userStats.nValidatedUploadedImages}
                      </StatNumber>
                    </Stat>
                  </StatGroup>
                ) : (
                  <Spinner />
                )}
                <Tabs
                  defaultIndex={-1}
                  variant="soft-rounded"
                  variantColor="green"
                  align="center"
                >
                  <TabList>
                    <Tab>Imágenes subidas</Tab>
                    <Tab>Asociaciones de Etiquetas - Categoría</Tab>
                    <Tab>Asociaciones de Imágenes - Categoría</Tab>
                    <Tab>Tips recibidos</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Stack align="center" textAlign="center">
                        {paginatedData.length === 0 ? (
                          <Text pt={3}>Sin imágenes subidas</Text>
                        ) : (
                          <Box pt={3}>{pagination}</Box>
                        )}

                        <Box mt={3}>
                          {selectedData.map(image => {
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
                                      <Box>
                                        <Tag>Fecha subida:</Tag>

                                        <Tag variantColor="blue">
                                          {format(
                                            new Date(image.uploadedAt),
                                            "PPPPpppp",
                                            {
                                              locale: esLocale,
                                            }
                                          )}
                                        </Tag>
                                      </Box>

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
                                          isLoading={loadingRemoveImage}
                                        >
                                          Eliminar imagen
                                        </Button>
                                      </Confirm>
                                    </Stack>
                                  );
                                }}
                              </LazyImage>
                            );
                          })}
                        </Box>

                        {paginatedData.length !== 0 && (
                          <Box pt={3} pb={3}>
                            {pagination}
                          </Box>
                        )}
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
                                    <Tag>Etiqueta:</Tag>
                                    <Tag ml={1} variantColor="blue">
                                      {tagAssoc.tag.name}
                                    </Tag>
                                  </Flex>
                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Eligió categoría:</Tag>
                                    {!tagAssoc.categoryChosen ? (
                                      <Tag ml={1} variantColor="gray">
                                        Ninguna
                                      </Tag>
                                    ) : (
                                      <Tag
                                        key={tagAssoc.categoryChosen._id}
                                        ml={1}
                                        variantColor="green"
                                      >
                                        {tagAssoc.categoryChosen.name}
                                      </Tag>
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
                                    <Tag>Eligió categoría:</Tag>
                                    {!catImgAssoc.categoryChosen ? (
                                      <Tag ml={1} variantColor="gray">
                                        Ninguna
                                      </Tag>
                                    ) : (
                                      <Tag
                                        key={catImgAssoc.categoryChosen._id}
                                        ml={1}
                                        variantColor="green"
                                      >
                                        {catImgAssoc.categoryChosen.name}
                                      </Tag>
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
                    <TabPanel>
                      <Stack>
                        {readTips.length === 0 ? (
                          <Text p="2em" textAlign="center">
                            Sin tips recibidos
                          </Text>
                        ) : (
                          readTips.map(tip => {
                            return (
                              <Tag key={tip._id} mt="1em">
                                {tip.text}
                              </Tag>
                            );
                          })
                        )}
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
      {loadingAllUsers ? (
        <Spinner />
      ) : (
        <Box cursor="pointer">
          <SemanticIcon
            name="repeat"
            onClick={() => {
              refetchAllUsers();
            }}
          />
        </Box>
      )}

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
