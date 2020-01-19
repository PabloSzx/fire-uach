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
  @Property({ default: 1 })
  imagesLevel: number;

  @Field(() => Int)
  @Property({ default: 1 })
  tagsLevel: number;

  @Field(() => Int)
  @Property({ default: 1 })
  uploadLevel: number;

  @Field(() => Int)
  @Property({ default: 1 })
  overallLevel: number;

  @Field(() => Int)
  @Property({ default: 0, index: true })
  score: number;

  @Field(() => Int)
  rankingPosition: number;
}

export const UserStatsModel = getModelForClass(UserStats);
