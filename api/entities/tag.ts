import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

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
  @Property({ required: true })
  name: string;

  @Field(() => [Category])
  @PropertyArray({ items: "Category", ref: "Category" })
  categories: Ref<Category>[];

  @Field(() => [Tag])
  @PropertyArray({ items: "Tag", ref: "Tag" })
  possibleTagAssociations: Ref<Tag>[];
}

export const TagModel = getModelForClass(Tag);
