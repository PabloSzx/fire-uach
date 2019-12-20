import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { ObjectId } from "mongodb";
import { generate } from "randomstring";
import { Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { UserType } from "../../../constants";
import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Image } from "../image";
import { Tag } from "../tags/tag";
import { TagAssociation } from "../tags/tagAssociation";
import { TagImageAssociation } from "../tags/tagImageAssociation";

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

  @Field(() => UserType)
  @Property({ enum: UserType, type: String, default: UserType.other })
  type: UserType;

  @Field()
  @Property({ default: "" })
  typeSpecify: string;

  @Field()
  @Property({ default: false })
  fireRelated: boolean;

  @Field({ nullable: true })
  @Property({ default: "" })
  fireRelatedSpecify: string;

  @Field()
  @Property({ default: false })
  locked: boolean;

  @Field()
  @Property({ default: () => generate() })
  unlockKey: string;

  @Field(() => [Image])
  imagesUploaded: Image[];

  @Field(() => [TagAssociation])
  tagAssociations: TagAssociation[];

  @Field(() => [TagImageAssociation])
  tagImageAssociations: TagImageAssociation[];

  @Field(() => [Image])
  notAssociatedImages: Image[];

  @Field(() => [Tag])
  notAssociatedTags: Tag[];
}

export const UserModel = getModelForClass(User);
