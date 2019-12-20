import { registerEnumType } from "type-graphql";

import { UserType } from "../../constants";

export const SECRET = process?.env?.SECRET ?? "jiojik334jio1nk23as";
registerEnumType(UserType, {
  name: "UserType",
});
