import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { TagCategoryAssociation } from "../components/TagCategoryAssociation";

const TagGamePage: NextPage = () => {
  return (
    <Stack
      className="tagGamePage"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <TagCategoryAssociation />
    </Stack>
  );
};

export default TagGamePage;
