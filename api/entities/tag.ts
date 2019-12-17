import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Category } from "./category";

@ObjectType()
export class Tag {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true, unique: true })
  name: string;

  @Field(() => [Category])
  categories: Category[];

  @Field(() => [Tag])
  @PropertyArray({ items: "Tag", ref: "Tag", default: [] })
  possibleTagAssociations: Ref<Tag>[];
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

  @Field(() => [ObjectIdScalar])
  possibleTagAssociations: ObjectId[];
}
