import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";

import { ADMIN } from "../../constants";
import {
  Category,
  CategoryModel,
  CreateCategory,
  EditCategory,
  RemoveCategory,
} from "../entities/category";

@Resolver(() => Category)
export class CategoryResolver {
  @Query(() => [Category])
  async categories() {
    return await CategoryModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Category])
  async createCategory(@Arg("data") { name }: CreateCategory) {
    await CategoryModel.create({
      name,
    });

    return await CategoryModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Category])
  async editCategory(@Arg("data") { _id, name }: EditCategory) {
    await CategoryModel.findByIdAndUpdate(
      _id,
      {
        name,
      },
      {
        setDefaultsOnInsert: true,
        select: "_id",
      }
    );

    return await CategoryModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Category])
  async removeCategory(@Arg("data") { _id }: RemoveCategory) {
    await CategoryModel.findByIdAndUpdate(
      _id,
      {
        active: false,
      },
      {
        setDefaultsOnInsert: true,
      }
    );

    return await CategoryModel.find({
      active: true,
    });
  }
}
