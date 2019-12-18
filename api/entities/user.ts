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

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Image } from "./image";
import { Tag } from "./tag";
import { TagAssociation } from "./TagAssociation";
import { TagImageAssociation } from "./TagImageAssociation";

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

  @Field()
  @Property({ default: () => generate() })
  unlockKey: string;

  @Field(() => [Image])
  imagesUploaded: Image[];

  @Field(() => [TagAssociation])
  @PropertyArray({ items: TagAssociation, default: [] })
  tagAssociations: TagAssociation[];

  @Field(() => [TagImageAssociation])
  @PropertyArray({ items: TagImageAssociation, default: [] })
  tagImageAssociations: TagImageAssociation[];

  @Field(() => [Image])
  notAssociatedImages: Image[];

  @Field(() => [Tag])
  notAssociatedTags: Tag[];
}

export const UserModel = getModelForClass(User);
