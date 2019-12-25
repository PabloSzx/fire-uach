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
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

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
  @Mutation(() => [TagCategoryAssociation])
  async resetTagCategoryAssociations(
    @Arg("user", () => ObjectIdScalar) user: ObjectId
  ) {
    await TagCategoryAssociationModel.deleteMany({
      user,
    });
    return await TagCategoryAssociationModel.find({
      user,
    });
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
    { tag, categoriesChosen, rejectedCategories }: TagCategoryAssociationAnswer
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await TagCategoryAssociationModel.findOneAndUpdate(
      {
        user: user._id,
        tag,
      },
      {
        categoriesChosen,
        rejectedCategories,
      },
      {
        upsert: true,
        new: true,
      }
    );

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
  async categoriesChosen(
    @Root() { categoriesChosen }: Partial<TagCategoryAssociation>
  ) {
    if (categoriesChosen) {
      if (isDocumentArray(categoriesChosen)) {
        return categoriesChosen;
      } else {
        return await CategoryModel.find({
          _id: {
            $in: categoriesChosen,
          },
        });
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
        return await CategoryModel.find({
          _id: {
            $in: rejectedCategories,
          },
        });
      }
    }
    return [];
  }
}
