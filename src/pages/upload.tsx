import { chunk, toInteger } from "lodash";
import { NextPage } from "next";
import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { IoIosImages } from "react-icons/io";
import LazyImage from "react-lazy-progressive-image";
import { useAsync } from "react-use";
import { Pagination } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Badge,
  Box,
  Flex,
  Icon,
  Image,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/core";

import { imagePlaceholder } from "../../constants";
import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { OWN_IMAGES, UPLOAD_IMAGE } from "../graphql/queries";

const UploadPage: NextPage = () => {
  const { loading: loadingUser, refetch, user } = useUser("/upload");

  const {
    data: dataOwnImages,
    loading: loadingOwnImages,
    error: errorOwnImages,
  } = useQuery(OWN_IMAGES, {
    ssr: false,
    skip: !user,
  });
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
          <Text>Subiendo imágen...</Text>
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
    <Stack align="center" justify="space-around" spacing="2em">
      {errorUpload && <Text>{JSON.stringify(errorUpload, null, 2)}</Text>}
      <Flex
        {...getRootProps()}
        justify="center"
        cursor="pointer"
        borderRadius="5px"
        border="3px solid"
        p={2}
      >
        <input {...getInputProps()} />
        <Icon name="add" size="3em" />
        <Box as={IoIosImages} size="3em" />
      </Flex>

      {uploadingImageSpinner}
      <Stack align="center" spacing={5}>
        <Box>
          <Pagination
            activePage={activePagination}
            onPageChange={(_e, { activePage }) => {
              setActivePagination(toInteger(activePage));
            }}
            totalPages={paginatedImages.length}
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
                      <Stack align="center" spacing={3}>
                        {loading && <Spinner />}
                        <Image
                          objectFit="contain"
                          width="100%"
                          height="100%"
                          maxH="50vh"
                          maxW="90vw"
                          src={src}
                        />
                      </Stack>
                    );
                  }}
                </LazyImage>
              </Box>
            );
          })
        )}
      </Stack>
    </Stack>
  );
};

export default UploadPage;
