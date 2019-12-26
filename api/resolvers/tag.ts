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
import { CategoryModel } from "../entities/category";
import { CreateTag, EditTag, RemoveTag, Tag, TagModel } from "../entities/tag";

@Resolver(() => Tag)
export class TagResolver {
  @Query(() => [Tag])
  async tags() {
    return await TagModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tag])
  async createTag(@Arg("data") { name }: CreateTag) {
    const categories = (
      await CategoryModel.find(
        {
          active: true,
        },
        "_id"
      ).sort({
        name: "asc",
      })
    ).map(({ _id }) => _id);
    await TagModel.findOneAndUpdate(
      {
        name,
      },
      {
        categories,
        active: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return await TagModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tag])
  async editTag(
    @Arg("data")
    { _id, name, categories }: EditTag
  ) {
    await TagModel.findByIdAndUpdate(
      _id,
      {
        name,
        categories,
      },
      {
        setDefaultsOnInsert: true,
        select: "_id",
      }
    );

    return await TagModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tag])
  async removeTag(@Arg("data") { _id }: RemoveTag) {
    await TagModel.findByIdAndUpdate(
      _id,
      {
        active: false,
      },
      {
        setDefaultsOnInsert: true,
      }
    );

    return await TagModel.find({
      active: true,
    });
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
          active: true,
        }).sort({
          name: "asc",
        });
      }
    }
    return [];
  }
}
