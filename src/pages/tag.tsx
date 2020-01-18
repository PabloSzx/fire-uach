import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { CategoriesContextContainer } from "../components/Categories";
import { TagCategoryAssociation } from "../components/TagCategoryAssociation";
import { useShouldBeCentered } from "../utils/useShouldBeCentered";

const TagGamePage: NextPage = () => {
  const shouldBeCentered = useShouldBeCentered(450);
  return (
    <CategoriesContextContainer>
      <Stack
        transition="all 1s"
        className="tagGamePage"
        {...(shouldBeCentered
          ? { height: "100%", justifyContent: "center", alignItems: "center" }
          : {
              paddingTop: "0.2em",
              paddingBottom: "0.2em",
            })}
      >
        <TagCategoryAssociation />
      </Stack>
    </CategoriesContextContainer>
  );
};

export default TagGamePage;
