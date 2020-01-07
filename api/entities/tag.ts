import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@ObjectType()
export class Tag {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true, unique: true })
  name: string;

  @Property({ default: true })
  active: boolean;
}

export const TagModel = getModelForClass(Tag);

@InputType()
export class CreateTag implements Partial<Tag> {
  @Field()
  name: string;
}

@InputType()
export class RemoveTag implements Partial<Tag> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;
}

@InputType()
export class EditTag implements Partial<Tag> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Field()
  name: string;
}
