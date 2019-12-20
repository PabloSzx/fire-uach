import { shuffle } from "lodash";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { isDocumentArray } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { CategoryModel } from "../entities/tags/category";
import {
  CreateTag,
  EditTag,
  RemoveTag,
  Tag,
  TagModel,
} from "../entities/tags/tag";
import { TagAssociationModel } from "../entities/tags/tagAssociation";
import { IContext } from "../interfaces";

@Resolver(() => Tag)
export class TagResolver {
  @Query(() => [Tag])
  async tags() {
    return await TagModel.find({});
  }

  @Query(() => [Tag])
  async notAnsweredTags(@Ctx() { user }: IContext) {
    const answeredTags = (user
      ? await TagAssociationModel.find(
          {
            user: user._id,
          },
          "tagMain"
        )
      : []
    ).map(({ tagMain }) => tagMain);
    return shuffle(
      await TagModel.find({
        _id: {
          $not: {
            $in: answeredTags,
          },
        },
      })
    );
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tag])
  async createTag(@Arg("data") { name }: CreateTag) {
    await TagModel.create({
      name,
    });

    return await TagModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tag])
  async editTag(
    @Arg("data")
    { _id, name, possibleTagAssociations, correctTagAssociations }: EditTag
  ) {
    await TagModel.findByIdAndUpdate(
      _id,
      {
        name,
        possibleTagAssociations,
        correctTagAssociations,
      },
      {
        setDefaultsOnInsert: true,
        select: "_id",
      }
    );

    return await TagModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tag])
  async removeTag(@Arg("data") { _id }: RemoveTag) {
    await TagModel.findByIdAndRemove(_id, {
      select: "_id",
    });

    return await TagModel.find({});
  }

  @FieldResolver()
  async categories(@Root() { _id }: Partial<Tag>) {
    if (_id) {
      return await CategoryModel.find({
        tags: _id,
      });
    }
    return [];
  }

  @FieldResolver()
  async correctTagAssociations(
    @Root() { correctTagAssociations }: Partial<Tag>
  ) {
    if (correctTagAssociations) {
      if (isDocumentArray(correctTagAssociations)) {
        return correctTagAssociations;
      } else {
        return await TagModel.find({
          _id: {
            $in: correctTagAssociations,
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
