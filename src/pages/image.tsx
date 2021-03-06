import { NextPage } from "next";

import { Stack } from "@chakra-ui/core";

import { CategoriesContextContainer } from "../components/Categories";
import { CategoryImageAssociation } from "../components/CategoryImageAssociation";
import { useShouldBeCentered } from "../utils/useShouldBeCentered";

const ImageGamePage: NextPage = () => {
  const shouldBeCentered = useShouldBeCentered(550);

  return (
    <CategoriesContextContainer>
      <Stack
        className="imageGamePage"
        transition="all 1s"
        {...(shouldBeCentered
          ? {
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }
          : {
              paddingTop: "0.2em",
              paddingBottom: "0.2em",
            })}
      >
        <CategoryImageAssociation />
      </Stack>
    </CategoriesContextContainer>
  );
};

export default ImageGamePage;
