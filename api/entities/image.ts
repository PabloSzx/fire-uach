import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

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
import { User } from "./user";

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
  possibleTags: Tag[];

  @Field(() => [Category])
  @PropertyArray({ items: "Category", ref: "Category", default: [] })
  categories: Ref<Category>[];

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  uploader: Ref<User>;

  @Field(() => Date)
  readonly updatedAt: Readonly<Date>;

  @Field(() => Date)
  readonly createdAt: Readonly<Date>;
}

export const ImageModel = getModelForClass(Image);

@InputType()
export class EditImage implements Partial<Image> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Field()
  validated: boolean;

  @Field(() => [ObjectIdScalar])
  categories: ObjectId[];
}

@InputType()
export class RemoveImage implements Partial<Image> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;
}
