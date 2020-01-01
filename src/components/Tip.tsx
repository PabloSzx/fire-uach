import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { useLazyQuery } from "@apollo/react-hooks";
import { Icon, Stack, Text } from "@chakra-ui/core";

import { TIP } from "../graphql/queries";
import { useUser } from "./Auth";

export const useTip = ({
  tipNLimit = 10,
  tipOnStart,
}: {
  tipNLimit?: number;
  tipOnStart?: boolean;
} = {}) => {
  const { user } = useUser();
  const counter = useRef(0);

  const [getTip, { data }] = useLazyQuery(TIP);

  useEffect(() => {
    if (tipOnStart && user) {
      getTip();
    }
  }, [tipOnStart, user]);

  useEffect(() => {
    if (data?.tip) {
      toast(
        <Stack isInline alignItems="center">
          <Icon size="2em" name="info" />
          <Text fontSize="2em">{data.tip.text}</Text>
        </Stack>,
        {
          type: "info",
        }
      );
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
