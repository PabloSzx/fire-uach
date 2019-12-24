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
import { Image } from "../image";
import { Tag } from "../tag";
import { Location } from "../utils/location";

@ObjectType()
export class CategoryImageAssociation extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  user?: Ref<User>;

  @Field(() => Category, { nullable: true })
  @Property({ ref: "Category" })
  category?: Ref<Category>;

  @Field(() => Tag)
  @PropertyArray({ items: "Category", ref: "Category", default: [] })
  rejectedCategories?: Ref<Category>[];

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

export const CategoryImageAssociationModel = getModelForClass(
  CategoryImageAssociation
);

@InputType()
export class CategoryImageAssociationAnswer
  implements Partial<CategoryImageAssociation> {
  @Field(() => ObjectIdScalar, { nullable: true })
  category?: ObjectId;

  @Field(() => ObjectIdScalar)
  image: ObjectId;

  @Field(() => [ObjectIdScalar])
  rejectedCategories: ObjectId[];
}
