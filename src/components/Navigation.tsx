import { useRouter } from "next/router";
import { FC } from "react";
import {
  AiFillCamera,
  AiFillHome,
  AiFillSetting,
  AiOutlineCamera,
  AiOutlineHome,
  AiOutlinePoweroff,
  AiOutlineSetting,
} from "react-icons/ai";
import { MdPerson, MdPersonOutline } from "react-icons/md";

import { Box, Flex } from "@chakra-ui/core";

import { useUser } from "./Auth";
import { FakeHref } from "./FakeHref";

export const Navigation: FC = () => {
  const { user, refetch } = useUser();
  const { push, pathname } = useRouter();

  return (
    <Flex
      zIndex={10}
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
          as={pathname === "/" ? AiFillHome : AiOutlineHome}
          color="black"
          fontSize="2em"
          onClick={() => {
            refetch();
            push("/");
          }}
        />
      </FakeHref>

      <FakeHref href="/upload">
        <Box
          as={pathname === "/upload" ? AiFillCamera : AiOutlineCamera}
          color="black"
          fontSize="2em"
          onClick={() => {
            refetch();
            if (user) {
              push("/upload");
            } else {
              push("/login?route=/upload");
            }
          }}
        />
      </FakeHref>

      <FakeHref href="/profile">
        <Box
          as={pathname === "/profile" ? MdPerson : MdPersonOutline}
          color="black"
          fontSize="2em"
          onClick={() => {
            refetch();
            if (user) {
              push("/profile");
            } else {
              push("/login?route=/profile");
            }
          }}
        />
      </FakeHref>

      {user?.admin && (
        <FakeHref href="/admin">
          <Box
            as={pathname === "/admin" ? AiFillSetting : AiOutlineSetting}
            color="black"
            fontSize="2em"
            onClick={() => {
              refetch();
              push("/admin");
            }}
          />
        </FakeHref>
      )}

      {user && (
        <FakeHref href="/logout">
          <Box
            as={AiOutlinePoweroff}
            color={pathname === "/logout" ? "rgb(255,0,0)" : "black"}
            fontSize="2em"
            onClick={() => {
              push("/logout");
            }}
          />
        </FakeHref>
      )}
    </Flex>
  );
};
