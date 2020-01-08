import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { CategoriesContextContainer } from "../components/Categories";
import { TagCategoryAssociation } from "../components/TagCategoryAssociation";
import { useShouldBeCentered } from "../utils/useShouldBeCentered";

const TagGamePage: NextPage = () => {
  const shouldBeCentered = useShouldBeCentered();

  return (
    <CategoriesContextContainer>
      <Stack
        transition="all 1s"
        className="tagGamePage"
        {...(shouldBeCentered
          ? { height: "100%", justifyContent: "center", alignItems: "center" }
          : {
              paddingTop: "1em",
              paddingBottom: "1em",
            })}
      >
        <TagCategoryAssociation />
      </Stack>
    </CategoriesContextContainer>
  );
};

export default TagGamePage;
