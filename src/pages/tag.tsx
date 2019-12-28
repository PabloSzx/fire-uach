import { NextPage } from "next";
import { useWindowSize } from "react-use";

import { Stack } from "@chakra-ui/core";

import { TagCategoryAssociation } from "../components/TagCategoryAssociation";

const TagGamePage: NextPage = () => {
  return (
    <Stack
      className="tagGamePage"
      height="calc(100vh - 70px)"
      justifyContent="center"
      alignItems="center"
    >
      <TagCategoryAssociation />
    </Stack>
  );
};

export default TagGamePage;
