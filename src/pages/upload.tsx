import { format } from "date-fns";
import esLocale from "date-fns/locale/es";
import { chunk, toInteger } from "lodash";
import { NextPage } from "next";
import { FC, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { IoIosImages } from "react-icons/io";
import LazyImage from "react-lazy-progressive-image";
import { useAsync } from "react-use";
import { Pagination } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  Image,
  Spinner,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import { useUser } from "../components/Auth";
import { CategoriesContextContainer } from "../components/Categories";
import { CategoryImageAssociation } from "../components/CategoryImageAssociation";
import { LoadingPage } from "../components/LoadingPage";
import { OWN_IMAGES, UPLOAD_IMAGE } from "../graphql/queries";

const UploadImages: FC = () => {
  const { loading: loadingUser, refetch, user } = useUser("/upload");

  const { data: dataOwnImages, loading: loadingOwnImages } = useQuery(
    OWN_IMAGES,
    {
      ssr: false,
      skip: !user,
    }
  );
  const [
    uploadImage,
    { loading: loadingUpload, error: errorUpload },
  ] = useMutation(UPLOAD_IMAGE, {
    update: (cache, { data }) => {
      if (data?.uploadImage) {
        cache.writeQuery({
          query: OWN_IMAGES,
          data: {
            ownImages: data.uploadImage,
          },
        });
      }
    },
    onCompleted: async () => {
      await refetch();
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: ["image/png", "image/jpeg"],
    onDrop: async files => {
      for (const file of files) {
        await uploadImage({
          variables: {
            file,
          },
        });
      }
    },
    multiple: user?.admin ?? false,
  });

  const paginatedImages = useMemo(() => {
    return chunk(dataOwnImages?.ownImages ?? [], 10);
  }, [dataOwnImages]);
  const [activePagination, setActivePagination] = useRememberState(
    "upload_active_pagination",
    1
  );

  const loadingUploadImage = useAsync(() => {
    return new Promise<boolean>(resolve => {
      if (loadingUpload) {
        return resolve(true);
      }
      setTimeout(() => {
        resolve(false);
      }, 500);
    });
  }, [loadingUpload]);

  const uploadingImageSpinner = useMemo(() => {
    if (loadingUploadImage.loading || loadingUploadImage.value) {
      return (
        <Stack align="center">
          <Text>Cargando...</Text>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Stack>
      );
    }
    return null;
  }, [loadingUploadImage]);

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <>
      <Divider p={5} width="100%" />

      {errorUpload && <Text>{JSON.stringify(errorUpload, null, 2)}</Text>}
      <Box
        mt="3em"
        {...getRootProps()}
        cursor="pointer"
        borderRadius="5px"
        border="3px solid"
        p={2}
      >
        <input {...getInputProps()} />
        <Flex justify="center">
          <Icon name="add" size="3em" />
          <Box as={IoIosImages} size="3em" />
        </Flex>
        <Text m={1}>Haz click aquí para subir imágenes</Text>
      </Box>

      {uploadingImageSpinner}
      <Divider p={5} width="100%" />
      <Stack mt="2em" align="center" spacing="3em">
        <Box>
          <Heading>Imágenes subidas por tí</Heading>
        </Box>
        <Box>
          <Pagination
            activePage={activePagination}
            onPageChange={(_e, { activePage }) => {
              setActivePagination(toInteger(activePage));
            }}
            totalPages={paginatedImages.length}
            secondary
            pointing
          />
        </Box>
        {loadingOwnImages ? (
          <Spinner />
        ) : (
          paginatedImages[activePagination - 1]?.map(image => {
            return (
              <Box key={image._id}>
                <LazyImage
                  src={`/api/images/${image.filename}`}
                  placeholder={imagePlaceholder}
                >
                  {(src, loading) => {
                    return (
                      <Stack
                        align="center"
                        spacing={3}
                        border="1px solid"
                        borderRadius="5px"
                        p={5}
                      >
                        {loading && <Spinner />}
                        <Image
                          objectFit="contain"
                          width="100%"
                          height="100%"
                          maxH="50vh"
                          maxW="90vw"
                          src={src}
                        />
                        <Box>
                          <Tag>Fecha subida:</Tag>

                          <Tag variantColor="blue">
                            {format(new Date(image.uploadedAt), "PPPPpppp", {
                              locale: esLocale,
                            })}
                          </Tag>
                        </Box>
                      </Stack>
                    );
                  }}
                </LazyImage>
              </Box>
            );
          })
        )}
      </Stack>
    </>
  );
};

const UploadPage: NextPage = () => {
  return (
    <Stack pt="2em" align="center" justify="space-around" spacing="2em">
      <CategoriesContextContainer>
        <CategoryImageAssociation onlyOwnImages />
      </CategoriesContextContainer>
      <UploadImages />
    </Stack>
  );
};

export default UploadPage;
