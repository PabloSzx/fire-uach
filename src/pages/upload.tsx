import { NextPage } from "next";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoIosImages } from "react-icons/io";
import Select from "react-select";
import { useUpdateEffect } from "react-use";

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

import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { CATEGORIES_OPTIONS, UPLOAD_IMAGE } from "../graphql/queries";

const UploadPage: NextPage = () => {
  const { loading: loadingUser, refetch, user } = useUser("/upload");

  const [
    uploadImage,
    { data: uploadedImageData, loading: loadingUpload, error: errorUpload },
  ] = useMutation(UPLOAD_IMAGE, {
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
    multiple: user.admin ?? false,
  });

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
      <Box maxHeight="80vh">
        {loadingUpload ? (
          <Spinner />
        ) : (
          uploadedImageData?.uploadImage[0]?.filename && (
            <>
              <Image
                objectFit="contain"
                width="100%"
                height="100%"
                maxH="60vh"
                maxW="90vw"
                src={`/api/images/${uploadedImageData.uploadImage[0].filename}`}
              />
            </>
          )
        )}
      </Box>
    </Stack>
  );
};

export default UploadPage;
