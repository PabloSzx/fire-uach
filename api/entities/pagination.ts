import { Field, InputType, Int, ObjectType } from "type-graphql";

@InputType()
export class PaginationArg {
  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  after: number;
}

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  pageCount: number;
}
