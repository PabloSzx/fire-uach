import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { FC } from "react";
import { AiFillHome, AiFillSetting, AiOutlinePoweroff } from "react-icons/ai";
import { IoLogoGameControllerB } from "react-icons/io";
import { MdPerson } from "react-icons/md";

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
          as={AiFillHome}
          color={pathname === "/" ? "#8BC63E" : "black"}
          fontSize="2em"
          onClick={() => {
            refetch();
            push("/");
          }}
        />
      </FakeHref>
      <FakeHref href="/games">
        <Box
          as={IoLogoGameControllerB}
          color={(() => {
            switch (pathname) {
              case "/games":
              case "/tag":
              case "/image":
              case "/upload":
                return "#8BC63E";
              default:
                return "black";
            }
          })()}
          fontSize="2em"
          onClick={() => {
            refetch();
            push("/games");
          }}
        />
      </FakeHref>

      <FakeHref href="/profile">
        <Box
          as={MdPerson}
          color={pathname === "/profile" ? "#8BC63E" : "black"}
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
      <AnimatePresence>
        {user?.admin && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <FakeHref href="/admin">
              <Box
                as={AiFillSetting}
                color={pathname === "/admin" ? "#8BC63E" : "black"}
                fontSize="2em"
                onClick={() => {
                  refetch();
                  push("/admin");
                }}
              />
            </FakeHref>
          </motion.div>
        )}
        {user && (
          <motion.div
            key="logout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, display: "none" }}
          >
            <FakeHref href="/logout">
              <Box
                as={AiOutlinePoweroff}
                color={pathname === "/logout" ? "#8BC63E" : "black"}
                fontSize="2em"
                onClick={() => {
                  push("/logout");
                }}
              />
            </FakeHref>
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );
};
