import { Field, ObjectType } from "type-graphql";

import { prop as Property } from "@typegoose/typegoose";

@ObjectType()
export class Location {
  @Field()
  @Property({ required: true })
  latitude: number;

  @Field()
  @Property({ required: true })
  longitude: number;
}
