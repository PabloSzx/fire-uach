import { FC } from "react";

import { Flex, Spinner } from "@chakra-ui/core";

export const LoadingPage: FC = () => {
  return (
    <Flex
      pos="absolute"
      height="100vh"
      width="100vw"
      justify="center"
      align="center"
    >
      <Spinner size="xl" />
    </Flex>
  );
};
