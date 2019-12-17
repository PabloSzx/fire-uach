import { NextPage } from "next";
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { IoIosImages } from "react-icons/io";

import { useMutation } from "@apollo/react-hooks";
import { Box, Flex, Icon, Image, Spinner, Stack } from "@chakra-ui/core";

import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { UPLOAD_IMAGE } from "../graphql/queries";

const UploadPage: NextPage = () => {
  const { loading: loadingUser, refetch } = useUser("/upload");

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
  });

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <Stack align="center" justify="space-around" spacing="2em">
      <Flex {...getRootProps()} justify="center">
        <input {...getInputProps()} />
        <Icon name="add" size="4em" />
        <Box as={IoIosImages} size="4em" />
      </Flex>
      <Box maxHeight="80vh">
        {uploadedImageData?.uploadImage.filename && (
          <Image
            objectFit="fill"
            width="100%"
            height="100%"
            src={`/api/images/${uploadedImageData.uploadImage.filename}`}
          />
        )}
      </Box>
    </Stack>
  );
};

export default UploadPage;
