import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { Logout } from "../components/Logout";

const LogoutPage: NextPage = () => {
  return (
    <Stack
      height="calc(100vh - 70px)"
      justifyContent="center"
      alignItems="center"
    >
      <Logout />
    </Stack>
  );
};

export default LogoutPage;
