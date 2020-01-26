import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { ObjectId } from "mongodb";
import { generate } from "randomstring";
import { Field, InputType, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { UserType } from "../../../constants";
import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { CategoryImageAssociation } from "../associations/categoryImageAssociation";
import { TagCategoryAssociation } from "../associations/tagCategoryAssociation";
import { Image } from "../image";
import { Tip } from "../tip";

@ObjectType()
export class User {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => EmailAddress)
  @Property({ required: true, unique: true })
  email: string;

  @Field()
  @Property()
  username: string;

  @Property()
  password?: string;

  @Field()
  @Property({ default: false })
  admin: boolean;

  @Field()
  @Property({ default: () => generate() })
  unlockKey: string;

  @Field(() => UserType)
  @PropertyArray({
    enum: UserType,
    type: String,
    default: [],
    items: UserType,
  })
  types: UserType[];

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

  @Field(() => [TagCategoryAssociation])
  tagCategoryAssociations: TagCategoryAssociation[];

  @Field(() => [CategoryImageAssociation])
  categoryImageAssociations: CategoryImageAssociation[];

  @Field(() => [Tip])
  @PropertyArray({ items: "Tip", ref: "Tip", default: [] })
  readTips: Ref<Tip>[];

  @Property({ default: true })
  active: boolean;
}

export const UserModel = getModelForClass(User);

@InputType()
export class EditUser implements Partial<User> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Field()
  username: string;

  @Field()
  admin: boolean;

  @Field(() => [UserType])
  types: UserType[];

  @Field()
  typeSpecify: string;

  @Field()
  fireRelated: boolean;

  @Field()
  fireRelatedSpecify: string;

  @Field()
  locked: boolean;
}
