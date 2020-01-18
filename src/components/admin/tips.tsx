import { toInteger } from "lodash";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/core";

import {
  ALL_TIPS,
  CREATE_TIP,
  EDIT_TIP,
  REMOVE_TIP,
} from "../../graphql/adminQueries";
import { usePagination } from "../../utils/pagination";
import { Confirm } from "../Confirm";
import { tipToast } from "../Tip";

const EditTipComponent: FC<{
  _id: string;
  text: string;
  priority: number;
}> = ({ _id, text, priority }) => {
  const [dataText, setDataText] = useState(text);
  const [dataPriority, setDataPriority] = useState(priority);

  const [editTip, { loading: loadingEditTip }] = useMutation(EDIT_TIP);
  const [removeTip, { loading: loadingRemoveTip }] = useMutation(REMOVE_TIP, {
    update: (cache, { data }) => {
      if (data?.removeTip) {
        cache.writeQuery({
          query: ALL_TIPS,
          data: {
            allTips: data.removeTip,
          },
        });
      }
    },
  });

  return (
    <Stack key={_id} align="center" border="1px solid" spacing="2em" p={5}>
      <Stack align="center">
        <Text>Texto Tip</Text>
        <Textarea
          isInvalid={!dataText}
          value={dataText}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setDataText(value);
          }}
        />
      </Stack>

      <InputGroup>
        <InputLeftAddon>
          <Text>Prioridad Tip (mayor prioridad, antes se recibirá el tip)</Text>
        </InputLeftAddon>
        <Input
          value={dataPriority}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setDataPriority(toInteger(value));
          }}
        />
      </InputGroup>

      <Box>
        <Button
          variantColor="cyan"
          onClick={() => {
            tipToast(dataText);
          }}
        >
          Previsualizar tip
        </Button>
      </Box>

      <Box>
        <Button
          isLoading={loadingEditTip}
          onClick={() => {
            if (dataText) {
              editTip({
                variables: {
                  data: {
                    _id,
                    text: dataText,
                    priority: dataPriority,
                  },
                },
              });
            } else {
              alert("Favor especificar nombre para editar un tip");
            }
          }}
          variantColor="blue"
          isDisabled={
            !dataText ||
            loadingEditTip ||
            (dataText === text && dataPriority === priority)
          }
        >
          Guardar cambios
        </Button>
      </Box>
      <Box>
        <Confirm
          content={`¿Está seguro que desea eliminar el tip ${text}?`}
          confirmButton="Estoy seguro"
          cancelButton="Cancelar"
        >
          <Button
            variantColor="red"
            onClick={() => {
              removeTip({
                variables: {
                  _id,
                },
              });
            }}
            isLoading={loadingRemoveTip}
            isDisabled={loadingRemoveTip}
          >
            Eliminar tip
          </Button>
        </Confirm>
      </Box>
    </Stack>
  );
};

const AdminTips: FC = () => {
  const {
    data: dataAllTips,
    loading: loadingAllTips,
    error: errorAllTips,
  } = useQuery(ALL_TIPS, {
    fetchPolicy: "cache-and-network",
  });

  if (errorAllTips) {
    console.error(JSON.stringify(errorAllTips, null, 2));
  }

  const [newTip, setNewTip] = useRememberState("create_tip_input", "");

  const disabledNewTip = useMemo(() => {
    return (
      (dataAllTips?.allTips.findIndex(tip => {
        return tip.text === newTip;
      }) ?? -1) !== -1
    );
  }, [newTip, dataAllTips]);

  const [createTip, { loading: loadingNewTip }] = useMutation(CREATE_TIP, {
    update: (cache, { data }) => {
      if (data?.createTip) {
        cache.writeQuery({
          query: ALL_TIPS,
          data: {
            allTips: data.createTip,
          },
        });
      }
    },
  });

  const { pagination, selectedData } = usePagination({
    name: "admin_tips_pagination",
    data: dataAllTips?.allTips,
  });

  return (
    <Stack align="center">
      {loadingAllTips && <Spinner />}
      <Box p="2em">{pagination}</Box>
      {selectedData.map(tip => {
        return <EditTipComponent key={tip._id} {...tip} />;
      })}
      <Box p="2em">{pagination}</Box>
      <Stack align="center">
        <InputGroup>
          <InputLeftAddon>
            <Text>Tip nuevo</Text>
          </InputLeftAddon>
          <Input
            value={newTip}
            onChange={({
              target: { value },
            }: ChangeEvent<HTMLInputElement>) => {
              setNewTip(value);
            }}
          />
        </InputGroup>
        <Button
          isLoading={loadingNewTip}
          isDisabled={!newTip || disabledNewTip}
          onClick={() => {
            if (newTip) {
              createTip({
                variables: {
                  data: {
                    text: newTip,
                  },
                },
              });
              setNewTip("");
            }
          }}
          variantColor="green"
        >
          Crear nuevo tip
        </Button>
      </Stack>
    </Stack>
  );
};

export default AdminTips;
