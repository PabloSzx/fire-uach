import { FieldResolver, Resolver, Root } from "type-graphql";

import { Category } from "../entities/category";
import { TagModel } from "../entities/tag";

@Resolver(() => Category)
export class CategoryResolver {
  @FieldResolver()
  async tags(@Root() { _id }: Partial<Category>) {
    if (_id) {
      return await TagModel.find({
        categories: _id,
      });
    }
    return [];
  }
}
