import { NextPage } from "next";
import { useWindowSize } from "react-use";

import { Stack } from "@chakra-ui/core";

import { CategoryImageAssociation } from "../components/CategoryImageAssociation";

const ImageGamePage: NextPage = () => {
  const { width } = useWindowSize();
  const mobile = width < 1080;
  return (
    <Stack
      className="imageGamePage"
      height={mobile ? "100%" : "calc(100vh - 70px)"}
      justifyContent="center"
      alignItems="center"
      mt={mobile ? 5 : undefined}
    >
      <CategoryImageAssociation />
    </Stack>
  );
};

export default ImageGamePage;
