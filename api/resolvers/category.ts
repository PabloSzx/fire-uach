import { shuffle } from "lodash";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { ADMIN } from "../../constants";
import {
  Category,
  CategoryModel,
  CreateCategory,
  EditCategory,
  RemoveCategory,
} from "../entities/category";
import { IContext } from "../interfaces";

@Resolver(() => Category)
export class CategoryResolver {
  @Query(() => [Category])
  async categories() {
    return await CategoryModel.find({
      active: true,
    });
  }

  @Authorized()
  @Query(() => [Category])
  async notAnsweredCategories(@Ctx() { user }: IContext) {
    if (user) {
      return shuffle(
        await CategoryModel.find({
          active: true,
        })
      );
    }
    return [];
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
