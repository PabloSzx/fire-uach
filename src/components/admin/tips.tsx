import { toInteger } from "lodash";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useRememberState } from "use-remember-state";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Divider,
  Input,
  InputGroup,
  InputLeftAddon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/core";

import {
  ALL_TIPS,
  CREATE_TIP,
  EDIT_TIP,
  REMOVE_TIP,
} from "../../graphql/adminQueries";
import { Confirm } from "../Confirm";

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
    <Stack key={_id} align="center" spacing="2em" p={2}>
      <InputGroup>
        <InputLeftAddon>
          <Text>Texto Tip</Text>
        </InputLeftAddon>
        <Input
          value={dataText}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            setDataText(value);
          }}
        />
      </InputGroup>

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
            loadingEditTip || (dataText === text && dataPriority === priority)
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

      <Divider width="100%" />
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

  return (
    <Stack align="center" pt={5}>
      <Divider border="1px solid" width="100%" />

      {loadingAllTips && <Spinner />}
      {dataAllTips?.allTips.map(tip => {
        return <EditTipComponent key={tip._id} {...tip} />;
      })}
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
            if (newTip)
              createTip({
                variables: {
                  data: {
                    text: newTip,
                  },
                },
              });
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
