import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@ObjectType()
export class User {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => EmailAddress)
  @Property({ required: true })
  email: string;

  @Property()
  password?: string;

  @Field()
  @Property({ default: false })
  admin: boolean;

  @Field()
  @Property({ default: false })
  locked: boolean;
}

export const UserModel = getModelForClass(User);
