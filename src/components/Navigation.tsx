import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { IoIosHome, IoIosPerson, IoMdAddCircle } from "react-icons/io";

import { Box, Flex } from "@chakra-ui/core";

import { useUser } from "./Auth";

export const Navigation: FC = () => {
  const user = useUser();
  const { push } = useRouter();

  return (
    <Flex
      zIndex={1}
      position="fixed"
      left={0}
      bottom={0}
      borderTop="1px solid"
      borderColor="grey"
      backgroundColor="white"
      height="50px"
      width="100%"
      justifyContent="space-around"
      alignItems="center"
      p={0}
    >
      <Box
        cursor="pointer"
        as={IoIosHome}
        color="black"
        fontSize="2em"
        onClick={() => {
          push("/");
        }}
      />
      <Box
        cursor="pointer"
        as={IoMdAddCircle}
        color="black"
        fontSize="2em"
        onClick={() => {
          if (user) {
            push("/upload");
          } else {
            push("/login?route=upload");
          }
        }}
      />
      <Box
        cursor="pointer"
        as={IoIosPerson}
        color="black"
        fontSize="2em"
        onClick={() => {
          if (user) {
            push("/profile");
          } else {
            push("/login?route=profile");
          }
        }}
      />
    </Flex>
  );
};
