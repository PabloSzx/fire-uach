import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";

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

  @Field(() => Date)
  updatedAt: Readonly<Date>;

  @Field(() => Date)
  createdAt: Readonly<Date>;
}

export const ImageModel = getModelForClass(Image);
