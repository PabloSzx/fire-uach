import { Field, InputType, ObjectType } from "type-graphql";

import { prop as Property } from "@typegoose/typegoose";

@ObjectType()
@InputType("LocationInput")
export class Location {
  @Field()
  @Property({ required: true })
  latitude: number;

  @Field()
  @Property({ required: true })
  longitude: number;
}
