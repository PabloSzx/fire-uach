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
  CategoryImageAssociation,
  CategoryImageAssociationInput,
  CategoryImageAssociationModel,
} from "../entities/associations/categoryImageAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Image, ImageModel } from "../entities/image";
import { TagModel } from "../entities/tag";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

@Resolver(() => CategoryImageAssociation)
export class CategoryImageAssociationResolver {
  @Authorized([ADMIN])
  @Query(() => [CategoryImageAssociation])
  async resultsTagImageAssociations() {
    return await CategoryImageAssociationModel.find({});
  }

  @Authorized()
  @Mutation(() => Image, { nullable: true })
  async answerTagImageAssociation(
    @Ctx() { user }: IContext,
    @Arg("data")
    { image, category, rejectedCategories }: CategoryImageAssociationInput
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await CategoryImageAssociationModel.create({
      user: user._id,
      category,
      rejectedCategories,
      image,
    });

    return await ImageModel.findById(image);
  }

  @FieldResolver()
  async user(@Root() { user }: Partial<CategoryImageAssociation>) {
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
  async category(@Root() { category }: Partial<CategoryImageAssociation>) {
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
  async rejectedCategories(
    @Root() { rejectedCategories }: Partial<CategoryImageAssociation>
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
    return null;
  }

  @FieldResolver()
  async image(@Root() { image }: Partial<CategoryImageAssociation>) {
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
