import { NextPage } from "next";
import { useWindowSize } from "react-use";

import { Stack } from "@chakra-ui/core";

import { CategoriesContextContainer } from "../components/Categories";
import { CategoryImageAssociation } from "../components/CategoryImageAssociation";

const ImageGamePage: NextPage = () => {
  const { height } = useWindowSize();
  const small = height < 500;
  return (
    <CategoriesContextContainer>
      <Stack
        className="imageGamePage"
        height={small ? "100%" : "calc(100vh - 70px)"}
        justifyContent="center"
        alignItems="center"
        mt={small ? 5 : undefined}
      >
        <CategoryImageAssociation />
      </Stack>
    </CategoriesContextContainer>
  );
};

export default ImageGamePage;
