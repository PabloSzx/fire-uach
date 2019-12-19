import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Tag } from "./tag";

@ObjectType()
export class Category {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true, unique: true })
  name: string;

  @Field(() => [Tag], { nullable: true })
  @PropertyArray({ items: "Tag", ref: "Tag", default: [] })
  correctTags: Ref<Tag>[];

  @Field(() => [Tag])
  @PropertyArray({ items: "Tag", ref: "Tag", default: [] })
  tags: Ref<Tag>[];
}

export const CategoryModel = getModelForClass(Category);

@InputType()
export class CreateCategory implements Partial<Category> {
  @Field()
  name: string;
}

@InputType()
export class RemoveCategory implements Partial<Category> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;
}

@InputType()
export class EditCategory implements Partial<Category> {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  name: string;

  @Field(() => [ObjectIdScalar])
  correctTags: ObjectId[];

  @Field(() => [ObjectIdScalar])
  tags: ObjectId[];
}
