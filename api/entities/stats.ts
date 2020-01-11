import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property, Ref } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { User } from "./auth/user";

@ObjectType()
export class UserStats {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  user?: Ref<User>;

  @Field(() => Int)
  @Property({ default: 0 })
  nAssociatedImages: number;

  @Field(() => Int)
  @Property({ default: 0 })
  nAssociatedTags: number;

  @Field(() => Int)
  @Property({ default: 0 })
  nUploadedImages: number;

  @Field(() => Int)
  @Property({ default: 0 })
  nValidatedUploadedImages: number;

  @Field(() => Int)
  @Property({ default: 1, index: true })
  level: number;

  @Field(() => Int)
  @Property({ default: 0, index: true })
  score: number;
}

export const UserStatsModel = getModelForClass(UserStats);
