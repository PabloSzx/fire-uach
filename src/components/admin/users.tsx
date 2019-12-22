import { chunk, isEqual, toInteger } from "lodash";
import { ChangeEvent, FC, Fragment, useMemo, useState } from "react";
import LazyImage from "react-lazy-progressive-image";
import { useSetState } from "react-use";
import { Pagination, Table } from "semantic-ui-react";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Accordion,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
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
  Tag,
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
} from "../../graphql/adminQueries";
import { userTypeToText } from "../../utils/enums";
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
  tagAssociations,
  tagImageAssociations,
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
          refetchAllUsers();
        }
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
      <Modal isOpen={isOpen} onClose={onClose} size="80vw">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Tag variantColor="blue">{email}</Tag>
          </ModalHeader>
          <ModalCloseButton cursor="pointer" />
          <ModalBody>
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
              <Box w="100%">
                <Accordion defaultIndex={-1} allowToggle w="100%">
                  <AccordionItem>
                    <AccordionHeader cursor="pointer">
                      <Box flex="1" textAlign="left">
                        Imágenes subidas
                      </Box>

                      <AccordionIcon />
                    </AccordionHeader>
                    <AccordionPanel textAlign="center">
                      <Pagination
                        activePage={activePagination}
                        onPageChange={(_e, { activePage }) => {
                          setActivePagination(toInteger(activePage));
                        }}
                        totalPages={paginatedImagesUploaded.length}
                      />
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
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <AccordionHeader cursor="pointer">
                      <Box flex="1" textAlign="left">
                        Asociaciones de Tags
                      </Box>
                      <AccordionIcon />
                    </AccordionHeader>
                    <AccordionPanel>
                      <Stack spacing="2em">
                        {tagAssociations.map((tagAssoc, key) => {
                          return (
                            <Fragment key={tagAssoc._id}>
                              {key !== 0 && (
                                <Divider
                                  width="100%"
                                  borderBottom="1px solid"
                                />
                              )}
                              {tagAssoc.tagMain && tagAssoc.tagChosen && (
                                <Stack>
                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Principal:</Tag>
                                    <Tag ml={1} variantColor="blue">
                                      {tagAssoc.tagMain.name}
                                    </Tag>
                                  </Flex>
                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Eligió:</Tag>
                                    <Tag ml={1} variantColor="green">
                                      {tagAssoc.tagChosen.name}
                                    </Tag>
                                  </Flex>

                                  <Flex mt={1} p={2} wrap="wrap">
                                    <Tag>Rechazó:</Tag>
                                    {tagAssoc.rejectedTags.map(tag => {
                                      return (
                                        <Tag
                                          key={tag._id}
                                          m={1}
                                          variantColor="yellow"
                                        >
                                          {tag.name}
                                        </Tag>
                                      );
                                    })}
                                  </Flex>
                                </Stack>
                              )}
                            </Fragment>
                          );
                        })}
                      </Stack>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <AccordionHeader cursor="pointer">
                      <Box flex="1" textAlign="left">
                        Asociaciones de Imagenes - Tags
                      </Box>

                      <AccordionIcon />
                    </AccordionHeader>
                    <AccordionPanel>
                      <Stack spacing="2em" align="center">
                        {tagImageAssociations.map((tagImgAssoc, key) => {
                          return (
                            <Fragment key={tagImgAssoc._id}>
                              {key !== 0 && (
                                <Divider
                                  borderBottom="1px solid"
                                  width="100%"
                                />
                              )}
                              {tagImgAssoc.category &&
                                tagImgAssoc.image &&
                                tagImgAssoc.tag && (
                                  <Stack align="center">
                                    <LazyImage
                                      placeholder={imagePlaceholder}
                                      src={`/api/images/${tagImgAssoc.image.filename}`}
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
                                              alt={tagImgAssoc.image?.filename}
                                              objectFit="contain"
                                            />
                                          </Stack>
                                        );
                                      }}
                                    </LazyImage>
                                    <Flex mt={1} p={2} wrap="wrap">
                                      <Tag>Categoría:</Tag>
                                      <Tag ml={1} variantColor="blue">
                                        {tagImgAssoc.category.name}
                                      </Tag>
                                    </Flex>
                                    <Flex mt={1} p={2} wrap="wrap">
                                      <Tag>Eligió:</Tag>
                                      <Tag ml={1} variantColor="green">
                                        {tagImgAssoc.tag.name}
                                      </Tag>
                                    </Flex>

                                    <Flex mt={1} p={2} wrap="wrap">
                                      <Tag>Rechazó:</Tag>
                                      {tagImgAssoc.rejectedTags.map(tag => {
                                        return (
                                          <Tag
                                            key={tag._id}
                                            m={1}
                                            variantColor="yellow"
                                          >
                                            {tag.name}
                                          </Tag>
                                        );
                                      })}
                                    </Flex>
                                  </Stack>
                                )}
                            </Fragment>
                          );
                        })}
                      </Stack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>
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
  } = useQuery(ALL_USERS, {
    fetchPolicy: "cache-and-network",
  });

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
