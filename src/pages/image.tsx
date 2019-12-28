import { NextPage } from "next";
import { useWindowSize } from "react-use";

import { Stack } from "@chakra-ui/core";

import { CategoryImageAssociation } from "../components/CategoryImageAssociation";

const ImageGamePage: NextPage = () => {
  const { height } = useWindowSize();
  const small = height < 500;
  return (
    <Stack
      className="imageGamePage"
      height={small ? "100%" : "calc(100vh - 70px)"}
      justifyContent="center"
      alignItems="center"
      mt={small ? 5 : undefined}
    >
      <CategoryImageAssociation />
    </Stack>
  );
};

export default ImageGamePage;
