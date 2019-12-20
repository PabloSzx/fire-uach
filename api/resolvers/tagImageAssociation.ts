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

import { UserModel } from "../entities/auth/user";
import { Image, ImageModel } from "../entities/image";
import { CategoryModel } from "../entities/tags/category";
import { TagModel } from "../entities/tags/tag";
import {
  TagImageAssociation,
  TagImageAssociationInput,
  TagImageAssociationModel,
} from "../entities/tags/tagImageAssociation";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

@Resolver(() => TagImageAssociation)
export class TagImageAssociationResolver {
  @Authorized()
  @Query(() => [TagImageAssociation])
  async resultsTagImageAssociations(@Ctx() { user }: IContext) {
    assertIsDefined(user, "Auth context is not working properly!");

    return await TagImageAssociationModel.find({
      user: user._id,
    });
  }

  @Authorized()
  @Mutation(() => Image, { nullable: true })
  async answerTagImageAssociation(
    @Ctx() { user }: IContext,
    @Arg("data")
    { image, category, tag, rejectedTags }: TagImageAssociationInput
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await TagImageAssociationModel.create({
      user: user._id,
      category,
      tag,
      rejectedTags,
      image,
    });

    return await ImageModel.findById(image);
  }

  @FieldResolver()
  async user(@Root() { user }: Partial<TagImageAssociation>) {
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
  async category(@Root() { category }: Partial<TagImageAssociation>) {
    if (category) {
      if (isDocument(category)) {
        return category;
      } else {
        return await CategoryModel.findById(category);
      }
    }
    return null;
  }

  @FieldResolver()
  async tag(@Root() { tag }: Partial<TagImageAssociation>) {
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
  async rejectedTags(@Root() { rejectedTags }: Partial<TagImageAssociation>) {
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
    return null;
  }

  @FieldResolver()
  async image(@Root() { image }: Partial<TagImageAssociation>) {
    if (image) {
      if (isDocument(image)) {
        return image;
      } else {
        return await ImageModel.findById(image);
      }
    }
    return null;
  }
}
