import { Stack } from "@chakra-ui/core";

// import { CategoryImageAssociation } from "../components/CategoryImageAssociation";
import { Logout } from "../components/Logout";

// import { TagCategoryAssociation } from "../components/TagCategoryAssociation";

export default () => {
  return (
    <Stack align="center" spacing="2em">
      {/* <TagCategoryAssociation />
      <CategoryImageAssociation /> */}
      <Logout />
    </Stack>
  );
};
