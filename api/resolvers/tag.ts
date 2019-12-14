import { Authorized, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { isDocumentArray } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { CategoryModel } from "../entities/category";
import { Tag, TagModel } from "../entities/tag";

@Resolver(() => Tag)
export class TagResolver {
  @Authorized([ADMIN])
  @Query(() => [Tag])
  async tags() {
    return await TagModel.find({});
  }

  @FieldResolver()
  async categories(@Root() { categories }: Partial<Tag>) {
    if (categories) {
      if (isDocumentArray(categories)) {
        return categories;
      } else {
        return await CategoryModel.find({
          _id: {
            $in: categories,
          },
        });
      }
    }
    return [];
  }

  @FieldResolver()
  async possibleTagAssociations(
    @Root() { possibleTagAssociations }: Partial<Tag>
  ) {
    if (possibleTagAssociations) {
      if (isDocumentArray(possibleTagAssociations)) {
        return possibleTagAssociations;
      } else {
        return await TagModel.find({
          _id: {
            $in: possibleTagAssociations,
          },
        });
      }
    }
    return [];
  }
}
