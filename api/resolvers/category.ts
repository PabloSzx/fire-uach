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
} from "../entities/tags/category";
import { TagModel } from "../entities/tags/tag";

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
  async editCategory(@Arg("data") { _id, name, tags }: EditCategory) {
    await CategoryModel.findByIdAndUpdate(
      _id,
      {
        name,
        tags,
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
