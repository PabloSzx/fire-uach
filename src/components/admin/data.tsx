import { saveAs } from "file-saver";
import { FC, useEffect } from "react";
import { FaImage, FaTag } from "react-icons/fa";

import { useMutation } from "@apollo/react-hooks";
import { Button, Stack } from "@chakra-ui/core";

import {
  CSV_RESULTS_CATEGORY_IMAGE,
  CSV_RESULTS_TAG_CATEGORIES,
} from "../../graphql/adminQueries";

const AdminData: FC = () => {
  const [
    getTagResults,
    {
      loading: loadingCsvTagResults,
      data: dataCsvTagResults,
      error: errorCsvTagResults,
    },
  ] = useMutation(CSV_RESULTS_TAG_CATEGORIES);

  const [
    getImageResults,
    {
      loading: loadingCsvImageResults,
      data: dataCsvImageResults,
      error: errorCsvImageResults,
    },
  ] = useMutation(CSV_RESULTS_CATEGORY_IMAGE);

  useEffect(() => {
    if (dataCsvImageResults) {
      saveAs(
        new Blob([dataCsvImageResults.csvResultsCategoryImageAssociations], {
          type: "text/plain;charset=utf-8",
        }),
        `Resultados Imagen-Categoría ${new Date().toString()}.csv`
      );
    }
  }, [dataCsvImageResults]);

  useEffect(() => {
    if (dataCsvTagResults) {
      saveAs(
        new Blob([dataCsvTagResults.csvResultsTagCategoryAssociations], {
          type: "text/plain;charset=utf-8",
        }),
        `Resultados Etiqueta-Categoría ${new Date().toString()}.csv`
      );
    }
  }, [dataCsvTagResults]);

  if (errorCsvTagResults || errorCsvImageResults) {
    console.error(JSON.stringify(errorCsvTagResults || errorCsvImageResults));
  }

  return (
    <Stack align="center" m="2em" spacing="1em">
      <Button
        leftIcon="download"
        rightIcon={FaTag}
        variantColor="blue"
        isLoading={loadingCsvTagResults}
        isDisabled={loadingCsvTagResults}
        cursor="pointer"
        onClick={async () => {
          await getTagResults();
        }}
      >
        Descargar resultados asociaciones de etiqueta
      </Button>

      <Button
        leftIcon="download"
        rightIcon={FaImage}
        variantColor="blue"
        isLoading={loadingCsvImageResults}
        isDisabled={loadingCsvImageResults}
        cursor="pointer"
        onClick={async () => {
          await getImageResults();
        }}
      >
        Descargar resultados asociaciones de imagen
      </Button>
    </Stack>
  );
};

export default AdminData;
