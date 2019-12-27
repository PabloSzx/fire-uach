import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { CategoryImageAssociation } from "../components/CategoryImageAssociation";

const ImageGamePage: NextPage = () => {
  return (
    <Stack
      className="imageGamePage"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <CategoryImageAssociation />
    </Stack>
  );
};

export default ImageGamePage;
