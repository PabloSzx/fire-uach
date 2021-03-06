import { addDays, isAfter, isPast } from "date-fns";
import { toDate } from "date-fns-tz";
import esLocale from "date-fns/locale/es";
import { saveAs } from "file-saver";
import { FC, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { FaImage, FaTag } from "react-icons/fa";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Checkbox,
  Spinner,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/core";

import {
  CSV_RESULTS_CATEGORY_IMAGE,
  CSV_RESULTS_TAG_CATEGORIES,
  GENERAL_USER_PROGRESS,
} from "../../graphql/adminQueries";

registerLocale("es", esLocale);

const AdminData: FC = () => {
  const [minDate, setMinDate] = useRememberState(
    "minDateAdminDataCsv",
    addDays(new Date(), -7)
  );
  const [maxDate, setMaxDate] = useRememberState(
    "maxDateAdminDataCsv",
    addDays(new Date(), 30)
  );
  useEffect(() => {
    if (typeof minDate === "string") {
      setMinDate(new Date(minDate));
    }
    if (typeof maxDate === "string") {
      setMaxDate(new Date(maxDate));
    }
  }, []);
  const [onlyValidatedImages, setOnlyValidatedImages] = useRememberState(
    "onlyValidatedImagesCsvImageResults",
    false
  );
  const [
    getTagResults,
    {
      loading: loadingCsvTagResults,
      data: dataCsvTagResults,
      error: errorCsvTagResults,
    },
  ] = useMutation(CSV_RESULTS_TAG_CATEGORIES, {
    variables: {
      dateRange: { minDate, maxDate },
    },
  });

  const [
    getImageResults,
    {
      loading: loadingCsvImageResults,
      data: dataCsvImageResults,
      error: errorCsvImageResults,
    },
  ] = useMutation(CSV_RESULTS_CATEGORY_IMAGE, {
    variables: {
      onlyValidatedImages,
      dateRange: {
        minDate,
        maxDate,
      },
    },
  });

  const {
    data: dataGeneralUserProgress,
    loading: loadingGeneralUserProgress,
  } = useQuery(GENERAL_USER_PROGRESS, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (dataCsvImageResults) {
      saveAs(
        new Blob(
          ["\uFEFF" + dataCsvImageResults.csvResultsCategoryImageAssociations],
          {
            type: "text/csv;charset=UTF-8",
          }
        ),
        `Resultados imagen-categoría ${
          onlyValidatedImages ? "solo imágenes validadas " : ""
        }${new Date().toLocaleString("es-CL")}.csv`,
        {
          autoBom: false,
        }
      );
    }
  }, [dataCsvImageResults]);

  useEffect(() => {
    if (dataCsvTagResults) {
      saveAs(
        new Blob(
          ["\uFEFF" + dataCsvTagResults.csvResultsTagCategoryAssociations],
          {
            type: "text/csv;charset=UTF-8",
          }
        ),
        `Resultados Etiqueta-Categoría ${new Date().toLocaleString(
          "es-CL"
        )}.csv`,
        {
          autoBom: false,
        }
      );
    }
  }, [dataCsvTagResults]);

  if (errorCsvTagResults || errorCsvImageResults) {
    console.error(JSON.stringify(errorCsvTagResults || errorCsvImageResults));
  }

  return (
    <Stack align="center" m="2em" spacing="1em" justifyContent="center">
      <Box>
        <Tag m={1}>Filtro fecha mínima</Tag>
        <DatePicker
          locale="es"
          selected={toDate(minDate)}
          onChange={date => {
            if (date && isPast(date)) {
              setMinDate(date);
            } else {
              alert("Ingresar una fecha en el pasado");
            }
          }}
          maxDate={new Date()}
          showTimeSelect
          dateFormat="Pp"
        />
      </Box>
      <Box>
        <Tag m={1}>Filtro fecha máxima</Tag>
        <DatePicker
          locale="es"
          selected={toDate(maxDate)}
          onChange={date => {
            if (date && isAfter(date, minDate)) {
              setMaxDate(date);
            } else {
              alert("Ingresar una fecha después de la mínima");
            }
          }}
          minDate={toDate(minDate)}
          maxDate={addDays(new Date(), 365)}
          showTimeSelect
          dateFormat="Pp"
        />
      </Box>
      <Stack p="1em" border="1px solid" borderRadius="10px">
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
      </Stack>

      <Stack p="1em" border="1px solid" borderRadius="10px" align="center">
        <Checkbox
          borderColor="grey"
          isChecked={onlyValidatedImages}
          onChange={() => {
            setOnlyValidatedImages(checked => !checked);
          }}
        >
          Solo imágenes validadas
        </Checkbox>
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

      {loadingGeneralUserProgress ? (
        <Spinner />
      ) : (
        <Stack border="1px solid black" p={4}>
          {dataGeneralUserProgress?.generalUserProgress.map(
            (dataProgress, key) => {
              return <Text key={key}>{dataProgress}</Text>;
            }
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default AdminData;
