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
import { Location } from "./location";
import { Tag } from "./tag";
import { User } from "./user";

@ObjectType()
export class TagAssociation extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  user?: Ref<User>;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tagMain?: Ref<Tag>;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tagChosen?: Ref<Tag>;

  @Field(() => Tag)
  @PropertyArray({ items: "Tag", ref: "Tag", default: [] })
  rejectedTags?: Ref<Tag>[];

  @Field({ nullable: true })
  @Property({ _id: false })
  location?: Location;

  @Field()
  readonly updatedAt: Date;

  @Field()
  readonly createdAt: Date;
}

export const TagAssociationModel = getModelForClass(TagAssociation);

@InputType()
export class TagAssociationInput implements Partial<TagAssociation> {
  @Field(() => ObjectIdScalar)
  tagMain: ObjectId;

  @Field(() => ObjectIdScalar)
  tagChosen: ObjectId;

  @Field(() => [ObjectIdScalar])
  rejectedTags: ObjectId[];
}
