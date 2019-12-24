import { compact, shuffle } from "lodash";
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

import { isDocument, isDocumentArray, Ref } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import {
  TagCategoryAssociation,
  TagCategoryAssociationAnswer,
  TagCategoryAssociationModel,
} from "../entities/associations/tagCategoryAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Tag, TagModel } from "../entities/tag";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

@Resolver(() => TagCategoryAssociation)
export class TagCategoryAssociationResolver {
  async notAnsweredTagsQuery(user?: ObjectId) {
    const filterTags: {
      _id?: {
        $not: {
          $in: Ref<Tag>[];
        };
      };
    } = {};

    if (user) {
      filterTags._id = {
        $not: {
          $in: compact(
            (
              await TagCategoryAssociationModel.find(
                {
                  user,
                },
                "tag"
              )
            ).map(({ tag }) => tag)
          ),
        },
      };
    }

    return shuffle(
      await TagModel.find({
        active: true,
        ...filterTags,
      })
    );
  }

  @Authorized([ADMIN])
  @Query(() => [TagCategoryAssociation])
  async resultsTagCategoryAssociations() {
    return await TagCategoryAssociationModel.find({});
  }

  @Query(() => [Tag])
  async notAnsweredTags(@Ctx() { user }: IContext) {
    return await this.notAnsweredTagsQuery(user?._id);
  }

  @Authorized()
  @Mutation(() => [Tag])
  async answerTagCategoryAssociation(
    @Ctx() { user }: IContext,
    @Arg("data", () => TagCategoryAssociationAnswer)
    { tag, categoryChosen, rejectedCategories }: TagCategoryAssociationAnswer
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await TagCategoryAssociationModel.create({
      user: user._id,
      tag,
      categoryChosen,
      rejectedCategories,
    });

    return await this.notAnsweredTagsQuery(user._id);
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
  async rejectedCategories(
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
          active: true,
        });
      }
    }
    return [];
  }
}
