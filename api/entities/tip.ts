import { ObjectId } from "mongodb";
import { Field, InputType, Int, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@ObjectType()
export class Tip {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ default: "" })
  text: string;

  @Field(() => Int)
  @Property({ default: 0 })
  priority: number;
}

export const TipModel = getModelForClass(Tip);

@InputType()
export class CreateTip implements Partial<Tip> {
  @Field()
  text: string;
}

@InputType()
export class EditTip extends CreateTip {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Field({ defaultValue: 0 })
  priority: number;
}
