import { format } from "date-fns";
import esLocale from "date-fns/locale/es";
import { NextPage } from "next";
import { FC, MutableRefObject, useMemo, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { IoIosImages } from "react-icons/io";
import LazyImage from "react-lazy-progressive-image";
import { useAsync } from "react-use";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
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
import {
  NOT_ANSWERED_IMAGE,
  OWN_IMAGES,
  UPLOAD_IMAGE,
} from "../graphql/queries";
import { usePaginationAllData } from "../utils/pagination";

const UploadImages: FC<{ refetch: MutableRefObject<() => Promise<any>> }> = ({
  refetch: refetchRef,
}) => {
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
        refetchRef.current();
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

  const { data: dataNotAnsweredImage } = useQuery(NOT_ANSWERED_IMAGE, {
    fetchPolicy: "cache-first",
    ssr: false,
    variables: {
      onlyOwnImages: true,
    },
  });

  const { pagination, selectedData, paginatedData } = usePaginationAllData({
    name: "upload_own_images_pagination",
    data: dataOwnImages?.ownImages,
  });

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <>
      {errorUpload && <Text>{JSON.stringify(errorUpload, null, 2)}</Text>}
      {!dataNotAnsweredImage?.notAnsweredImage && (
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
          <Text m={1}>
            Haz click aquí para subir imágenes y luego asociarlas a una
            categoría
          </Text>
        </Box>
      )}

      {uploadingImageSpinner}
      {paginatedData.length !== 0 && (
        <>
          <Stack mt="2em" align="center" spacing="3em">
            <Box>
              <Heading>Imágenes subidas por tí</Heading>
            </Box>
            <Box>{pagination}</Box>
            {loadingOwnImages ? (
              <Spinner />
            ) : (
              selectedData.map(image => {
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
                                {format(
                                  new Date(image.uploadedAt),
                                  "PPPPpppp",
                                  {
                                    locale: esLocale,
                                  }
                                )}
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
            <Box>{pagination}</Box>
          </Stack>
        </>
      )}
    </>
  );
};

const UploadPage: NextPage = () => {
  const refetch = useRef<() => Promise<any>>(async () => {});
  return (
    <Stack
      pt="2em"
      pb="2em"
      align="center"
      justify="space-around"
      spacing="2em"
    >
      <CategoriesContextContainer>
        <CategoryImageAssociation onlyOwnImages refetch={refetch} />
      </CategoriesContextContainer>
      <UploadImages refetch={refetch} />
    </Stack>
  );
};

export default UploadPage;
