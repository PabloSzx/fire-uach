import { registerEnumType } from "type-graphql";

import { GameType, UserType } from "../../constants";

export const SECRET = process?.env?.SECRET ?? "jiojik334jio1nk23as";

registerEnumType(UserType, {
  name: "UserType",
});
registerEnumType(GameType, {
  name: "GameType",
});

export const SCORE_PER_TAG_ASSOCIATION = 2;
export const SCORE_PER_IMAGE_ASSOCIATION = 2;
export const SCORE_PER_UPLOADED_IMAGE = 5;
export const SCORE_PER_VALIDATED_UPLOADED_IMAGE = 10;
