import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { CategoriesContextContainer } from "../components/Categories";
import { TagCategoryAssociation } from "../components/TagCategoryAssociation";

const TagGamePage: NextPage = () => {
  return (
    <CategoriesContextContainer>
      <Stack
        className="tagGamePage"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <TagCategoryAssociation />
      </Stack>
    </CategoriesContextContainer>
  );
};

export default TagGamePage;
