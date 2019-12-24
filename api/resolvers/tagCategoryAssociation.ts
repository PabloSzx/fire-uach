import { shuffle } from "lodash";
import { ObjectId } from "mongodb";
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

import { isDocument, isDocumentArray } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import {
  TagCategoryAssociation,
  TagCategoryAssociationInput,
  TagCategoryAssociationModel,
} from "../entities/associations/tagCategoryAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Tag, TagModel } from "../entities/tag";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

@Resolver(() => TagCategoryAssociation)
export class TagCategoryAssociationResolver {
  async notAnsweredTagsQuery(user: ObjectId) {
    const answeredTags = (
      await TagCategoryAssociationModel.find(
        {
          user,
        },
        "tag"
      )
    ).map(({ tag }) => tag);

    return shuffle(
      await TagModel.find({
        _id: {
          $not: {
            $in: answeredTags,
          },
        },
        active: true,
      })
    );
  }

  @Authorized([ADMIN])
  @Query(() => [TagCategoryAssociation])
  async resultsTagAssociations() {
    return await TagCategoryAssociationModel.find({});
  }

  @Query(() => [Tag])
  async notAnsweredTags(@Ctx() { user }: IContext) {
    if (user) {
      return await this.notAnsweredTagsQuery(user._id);
    }
    return [];
  }

  @Authorized()
  @Mutation(() => [Tag])
  async answerTagAssociation(
    @Ctx() { user }: IContext,
    @Arg("data", () => TagCategoryAssociationInput)
    { tag, categoryChosen, rejectedCategories }: TagCategoryAssociationInput
  ) {
    if (user) {
      await TagCategoryAssociationModel.create({
        user: user._id,
        tag,
        categoryChosen,
        rejectedCategories,
      });

      return await this.notAnsweredTagsQuery(user._id);
    }
    return [];
  }

  @FieldResolver()
  async user(@Root() { user }: Partial<TagCategoryAssociation>) {
    if (user) {
      if (isDocument(user)) {
        return user;
      } else {
        return await UserModel.findById(user);
      }
    }
    return null;
  }

  @FieldResolver()
  async tag(@Root() { tag }: Partial<TagCategoryAssociation>) {
    if (tag) {
      if (isDocument(tag)) {
        return tag;
      } else {
        return await TagModel.findById(tag);
      }
    }
    return null;
  }

  @FieldResolver()
  async categoryChosen(
    @Root() { categoryChosen }: Partial<TagCategoryAssociation>
  ) {
    if (categoryChosen) {
      if (isDocument(categoryChosen)) {
        return categoryChosen;
      } else {
        return await CategoryModel.findById(categoryChosen);
      }
    }
    return null;
  }

  @FieldResolver()
  async rejectedTags(
    @Root() { rejectedCategories }: Partial<TagCategoryAssociation>
  ) {
    if (rejectedCategories) {
      if (isDocumentArray(rejectedCategories)) {
        return rejectedCategories;
      } else {
        return await TagModel.find({
          _id: {
            $in: rejectedCategories,
          },
        });
      }
    }
    return [];
  }
}
