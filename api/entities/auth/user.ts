import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { ObjectId } from "mongodb";
import { generate } from "randomstring";
import { Field, InputType, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property } from "@typegoose/typegoose";

import { UserType } from "../../../constants";
import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Image } from "../image";
import { TagAssociation } from "../tags/tagAssociation";
import { TagImageAssociation } from "../tags/tagImageAssociation";

@ObjectType()
export class User {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => EmailAddress)
  @Property({ required: true, unique: true })
  email: string;

  @Property()
  password?: string;

  @Field()
  @Property({ default: false })
  admin: boolean;

  @Field()
  @Property({ default: () => generate() })
  unlockKey: string;

  @Field(() => UserType, { nullable: true })
  @Property({
    enum: UserType,
    type: String,
    default: UserType.other,
  })
  type?: UserType;

  @Field()
  @Property({ default: "" })
  typeSpecify: string;

  @Field()
  @Property({ default: false })
  fireRelated: boolean;

  @Field()
  @Property({ default: "" })
  fireRelatedSpecify: string;

  @Field()
  @Property({ default: false })
  locked: boolean;

  @Field(() => [Image])
  imagesUploaded: Image[];

  @Field(() => [TagAssociation])
  tagAssociations: TagAssociation[];

  @Field(() => [TagImageAssociation])
  tagImageAssociations: TagImageAssociation[];
}

export const UserModel = getModelForClass(User);

@InputType()
export class EditUser implements Partial<User> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Field()
  admin: boolean;

  @Field(() => UserType, { nullable: true })
  type?: UserType;

  @Field()
  typeSpecify: string;

  @Field()
  fireRelated: boolean;

  @Field()
  fireRelatedSpecify: string;

  @Field()
  locked: boolean;
}
