import { Field, Int, ObjectType } from "type-graphql";

import { User } from "./auth/user";

@ObjectType()
export class Stats {
  @Field(() => User)
  user: User;

  @Field(() => Int)
  nAssociatedImages: number;

  @Field(() => Int)
  nAssociatedTags: number;

  @Field(() => Int)
  nUploadedImages: number;

  @Field(() => Int)
  nValidatedUploadedImages: number;
}
