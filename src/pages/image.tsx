import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { CategoriesContextContainer } from "../components/Categories";
import { CategoryImageAssociation } from "../components/CategoryImageAssociation";

const ImageGamePage: NextPage = () => {
  return (
    <CategoriesContextContainer>
      <Stack
        className="imageGamePage"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <CategoryImageAssociation />
      </Stack>
    </CategoriesContextContainer>
  );
};

export default ImageGamePage;
