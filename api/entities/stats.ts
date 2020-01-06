import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { User } from "./auth/user";

@ObjectType()
export class UserStats {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

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
