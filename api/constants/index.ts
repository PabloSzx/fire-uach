import { registerEnumType } from "type-graphql";

import { GameType, UserType } from "../../constants";

export const SECRET = process?.env?.SECRET ?? "jiojik334jio1nk23as";
registerEnumType(UserType, {
  name: "UserType",
});
registerEnumType(GameType, {
  name: "GameType",
});
