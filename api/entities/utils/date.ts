import { Field, InputType } from "type-graphql";

@InputType()
export class DateRange {
  @Field()
  minDate: Date;

  @Field()
  maxDate: Date;
}
