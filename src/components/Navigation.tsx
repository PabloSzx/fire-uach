import { useRouter } from "next/router";
import { FC } from "react";
import {
  IoIosHome,
  IoIosPerson,
  IoMdAddCircle,
  IoMdSettings,
} from "react-icons/io";

import { Box, Flex } from "@chakra-ui/core";

import { useUser } from "./Auth";
import { FakeHref } from "./FakeHref";

export const Navigation: FC = () => {
  const { user } = useUser();
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
      <FakeHref href="/">
        <Box
          as={IoIosHome}
          color="black"
          fontSize="2em"
          onClick={() => {
            push("/");
          }}
        />
      </FakeHref>
      <FakeHref href="/upload">
        <Box
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
      </FakeHref>

      <FakeHref href="/profile">
        <Box
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
      </FakeHref>
      {user?.admin && (
        <FakeHref href="/admin">
          <Box
            as={IoMdSettings}
            color="black"
            fontSize="2em"
            onClick={() => {
              push("/admin");
            }}
          />
        </FakeHref>
      )}
    </Flex>
  );
};
