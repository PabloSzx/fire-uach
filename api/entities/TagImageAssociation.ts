import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import { prop as Property, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Image } from "./image";
import { Location } from "./location";
import { Tag } from "./tag";

@ObjectType()
export class TagImageAssociation extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tag?: Ref<Tag>;

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
