import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import { prop as Property } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@ObjectType()
export class Tag {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  name: string;
}
