import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Tag } from "./tag";

@ObjectType()
export class Category {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true })
  name: string;

  @Field(() => [Tag])
  tags: Tag[];
}

export const CategoryModel = getModelForClass(Category);
