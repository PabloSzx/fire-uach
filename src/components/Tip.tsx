import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { useMutation } from "@apollo/react-hooks";
import { Icon, Stack, Text } from "@chakra-ui/core";

import { TIP } from "../graphql/queries";
import { useUser } from "./Auth";

export const tipToast = (text: string, autoClose = 15000) => {
  toast(
    <Stack isInline alignItems="center" m={1}>
      <Icon size="2em" name="info" />
      <Text fontSize="2em">{text}</Text>
    </Stack>,
    {
      type: "info",
      autoClose,
      closeOnClick: false,
    }
  );
};

export const useTip = ({
  tipNLimit = 10,
  tipOnStart,
}: {
  tipNLimit?: number;
  tipOnStart?: boolean;
} = {}) => {
  const { user } = useUser();
  const counter = useRef(0);

  const [getTip, { data }] = useMutation(TIP);

  useEffect(() => {
    if (tipOnStart && user) {
      getTip();
    }
  }, [tipOnStart, user]);

  useEffect(() => {
    if (data?.tip) {
      tipToast(data.tip.text);
    }
  }, [data]);

  return () => {
    if (user) {
      const nActivations = (counter.current += 1);
      if (nActivations >= tipNLimit) {
        counter.current = 0;
        getTip();
      }
    }
  };
};
