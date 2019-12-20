import { NextPage } from "next";
import { useEffect, useState } from "react";
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
import {
  CATEGORIES_OPTIONS,
  EDIT_OWN_IMAGE,
  UPLOAD_IMAGE,
} from "../graphql/queries";

const UploadPage: NextPage = () => {
  const { loading: loadingUser, refetch, user } = useUser("/upload");

  const { data: dataCategoriesOptions } = useQuery(CATEGORIES_OPTIONS);
  const [
    uploadImage,
    { data: uploadedImageData, loading: loadingUpload, error: errorUpload },
  ] = useMutation(UPLOAD_IMAGE, {
    onCompleted: async () => {
      await refetch();
    },
  });

  const [editOwnImage] = useMutation(EDIT_OWN_IMAGE);

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

  const [categoriesSelected, setCategoriesSelected] = useState<
    { _id: string; name: string }[]
  >([]);

  useUpdateEffect(() => {
    setCategoriesSelected(uploadedImageData?.uploadImage.categories ?? []);
  }, [uploadedImageData]);

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
          uploadedImageData?.uploadImage.filename && (
            <>
              <Image
                objectFit="contain"
                width="100%"
                height="100%"
                maxH="60vh"
                maxW="90vw"
                src={`/api/images/${uploadedImageData.uploadImage.filename}`}
              />
              <Stack align="center">
                <Badge>Categorías</Badge>
                <Box width="100%" minW="50vw">
                  <Select
                    value={categoriesSelected.map(({ _id, name }) => {
                      return {
                        label: name,
                        value: _id,
                      };
                    })}
                    options={
                      dataCategoriesOptions?.categories.map(({ _id, name }) => {
                        return {
                          label: name,
                          value: _id,
                        };
                      }) ?? []
                    }
                    isMulti
                    onChange={(selected: any) => {
                      const selectedCategories =
                        (selected as {
                          label: string;
                          value: string;
                        }[])?.map(({ value, label }) => {
                          return {
                            _id: value,
                            name: label,
                          };
                        }) ?? [];
                      setCategoriesSelected(selectedCategories);
                      editOwnImage({
                        variables: {
                          data: {
                            _id: uploadedImageData.uploadImage._id,
                            categories: selectedCategories.map(
                              ({ _id }) => _id
                            ),
                          },
                        },
                      });
                    }}
                    placeholder="Específicar categoría"
                    noOptionsMessage={() =>
                      "Cargando categorías disponibles..."
                    }
                  />
                </Box>
              </Stack>
            </>
          )
        )}
      </Box>
    </Stack>
  );
};

export default UploadPage;
