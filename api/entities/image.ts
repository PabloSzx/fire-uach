import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Category } from "./category";
import { Tag } from "./tag";

@ObjectType()
export class Image extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true, unique: true, index: true })
  filename: string;

  @Field()
  @Property({ required: true })
  mimetype: string;

  @Field()
  @Property({ required: true })
  extension: string;

  @Field()
  @Property({ default: false })
  validated: boolean;

  @Field(() => [Tag])
  @PropertyArray({ items: "Tag", ref: "Tag" })
  possibleTags: Ref<Tag>[];

  @Field(() => [Category])
  @PropertyArray({ items: "Category", ref: "Category" })
  categories: Ref<Category>[];

  @Field(() => Date)
  readonly updatedAt: Readonly<Date>;

  @Field(() => Date)
  readonly createdAt: Readonly<Date>;
}

export const ImageModel = getModelForClass(Image);
