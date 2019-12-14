import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import { prop as Property, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../utils/ObjectIdScalar";
import { Location } from "./location";
import { Tag } from "./tag";

@ObjectType()
export class TagAssociation extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tag1?: Ref<Tag>;

  @Field(() => Tag, { nullable: true })
  @Property({ ref: "Tag" })
  tag2?: Ref<Tag>;

  @Field({ nullable: true })
  @Property({ _id: false })
  location?: Location;

  @Field()
  readonly updatedAt: Date;

  @Field()
  readonly createdAt: Date;
}
