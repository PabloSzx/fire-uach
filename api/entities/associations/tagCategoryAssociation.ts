import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { User } from "../auth/user";
import { Category } from "../category";
import { Tag } from "../tag";
import { Location } from "../utils/location";

@ObjectType()
export class TagCategoryAssociation extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  user?: Ref<User>;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tag?: Ref<Tag>;

  @Field(() => Category, { nullable: true })
  @Property({ ref: "Category" })
  categoryChosen?: Ref<Category>;

  @Field(() => [Category])
  @PropertyArray({ items: "Category", ref: "Category", default: [] })
  rejectedCategories?: Ref<Category>[];

  @Field({ nullable: true })
  @Property({ _id: false })
  location?: Location;

  @Field()
  readonly updatedAt: Date;

  @Field()
  readonly createdAt: Date;
}

export const TagCategoryAssociationModel = getModelForClass(
  TagCategoryAssociation
);

@InputType()
export class TagCategoryAssociationAnswer
  implements Partial<TagCategoryAssociation> {
  @Field(() => ObjectIdScalar)
  tag: ObjectId;

  @Field(() => ObjectIdScalar, { nullable: true })
  categoryChosen?: ObjectId;

  @Field(() => [ObjectIdScalar])
  rejectedCategories: ObjectId[];

  @Field(() => Location, { nullable: true })
  location?: Location;
}
