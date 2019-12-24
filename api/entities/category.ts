import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@ObjectType()
export class Category {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true, unique: true })
  name: string;

  @Property({ default: true, index: true })
  active: boolean;
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
}
