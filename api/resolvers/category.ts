import {
  Arg,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { isDocumentArray } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import {
  Category,
  CategoryModel,
  CreateCategory,
  EditCategory,
  RemoveCategory,
} from "../entities/category";
import { TagModel } from "../entities/tag";

@Resolver(() => Category)
export class CategoryResolver {
  @Query(() => [Category])
  async categories() {
    return await CategoryModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [Category])
  async createCategory(@Arg("data") { name }: CreateCategory) {
    await CategoryModel.create({
      name,
    });

    return await CategoryModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [Category])
  async editCategory(
    @Arg("data") { _id, name, tags, correctTags }: EditCategory
  ) {
    await CategoryModel.findByIdAndUpdate(
      _id,
      {
        name,
        tags,
        correctTags,
      },
      {
        setDefaultsOnInsert: true,
        select: "_id",
      }
    );

    return await CategoryModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [Category])
  async removeCategory(@Arg("data") { _id }: RemoveCategory) {
    await CategoryModel.findByIdAndRemove(_id, { select: "_id" });

    return await CategoryModel.find({});
  }

  @FieldResolver()
  async correctTags(@Root() { correctTags }: Partial<Category>) {
    if (correctTags) {
      if (isDocumentArray(correctTags)) {
        return correctTags;
      } else {
        return await TagModel.find({
          _id: {
            $in: correctTags,
          },
        });
      }
    }
    return [];
  }

  @FieldResolver()
  async tags(@Root() { tags }: Partial<Category>) {
    if (tags) {
      if (isDocumentArray(tags)) {
        return tags;
      } else {
        return await TagModel.find({
          _id: {
            $in: tags,
          },
        });
      }
    }
    return [];
  }
}
