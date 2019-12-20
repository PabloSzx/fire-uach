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
import { UserModel } from "../entities/auth/user";
import { Tag, TagModel } from "../entities/tags/tag";
import {
  TagAssociation,
  TagAssociationInput,
  TagAssociationModel,
} from "../entities/tags/tagAssociation";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

@Resolver(() => TagAssociation)
export class TagAssociationResolver {
  @Authorized([ADMIN])
  @Query(() => [TagAssociation])
  async resultsTagAssociations(@Ctx() { user }: IContext) {
    assertIsDefined(user, "Auth context is not working properly!");

    return await TagAssociationModel.find({});
  }

  @Authorized()
  @Mutation(() => [Tag])
  async answerTagAssociation(
    @Ctx() { user }: IContext,
    @Arg("data", () => TagAssociationInput)
    { tagMain, tagChosen, rejectedTags }: TagAssociationInput
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await TagAssociationModel.create({
      user: user._id,
      tagMain,
      tagChosen,
      rejectedTags,
    });

    const answeredTags = (
      await TagAssociationModel.find(
        {
          user: user._id,
        },
        "tagMain"
      )
    ).map(({ tagMain }) => tagMain);
    return await TagModel.find({
      _id: {
        $not: {
          $in: answeredTags,
        },
      },
    });
  }

  @FieldResolver()
  async user(@Root() { user }: Partial<TagAssociation>) {
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
  async tagMain(@Root() { tagMain }: Partial<TagAssociation>) {
    if (tagMain) {
      if (isDocument(tagMain)) {
        return tagMain;
      } else {
        return await TagModel.findById(tagMain);
      }
    }
    return null;
  }

  @FieldResolver()
  async tagChosen(@Root() { tagChosen }: Partial<TagAssociation>) {
    if (tagChosen) {
      if (isDocument(tagChosen)) {
        return tagChosen;
      } else {
        return await TagModel.findById(tagChosen);
      }
    }
    return null;
  }

  @FieldResolver()
  async rejectedTags(@Root() { rejectedTags }: Partial<TagAssociation>) {
    if (rejectedTags) {
      if (isDocumentArray(rejectedTags)) {
        return rejectedTags;
      } else {
        return await TagModel.find({
          _id: {
            $in: rejectedTags,
          },
        });
      }
    }
    return [];
  }
}
