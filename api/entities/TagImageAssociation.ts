import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Category } from "./category";
import { Image } from "./image";
import { Location } from "./location";
import { Tag } from "./tag";
import { User } from "./user";

@ObjectType()
export class TagImageAssociation extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  user?: Ref<User>;

  @Field(() => Category, { nullable: true })
  @Property({ ref: "Category" })
  category?: Ref<Category>;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tag?: Ref<Tag>;

  @Field(() => Tag)
  @PropertyArray({ items: "Tag", ref: "Tag", default: [] })
  rejectedTags?: Ref<Tag>[];

  @Field(() => Image, { nullable: true })
  @Property({ ref: "Image" })
  image?: Ref<Image>;

  @Field({ nullable: true })
  @Property({ _id: false })
  location?: Location;

  @Field()
  readonly updatedAt: Date;

  @Field()
  readonly createdAt: Date;
}

export const TagImageAssociationModel = getModelForClass(TagImageAssociation);

@InputType()
export class TagImageAssociationInput implements Partial<TagImageAssociation> {
  @Field(() => ObjectIdScalar)
  category: ObjectId;

  @Field(() => ObjectIdScalar)
  image: ObjectId;

  @Field(() => ObjectIdScalar)
  tag: ObjectId;

  @Field(() => [ObjectIdScalar])
  rejectedTags: ObjectId[];
}
