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
  CategoryImageAssociation,
  CategoryImageAssociationAnswer,
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
  async notAnsweredImagesQuery(onlyValidated: boolean, user?: ObjectId) {
    const filterImages: {
      validated?: boolean;
      uploader?: ObjectId;
      _id?: {
        $not: {
          $in: ObjectId[];
        };
      };
    } = {};

    if (user) {
      filterImages._id = {
        $not: {
          $in: (
            await CategoryImageAssociationModel.find(
              {
                user,
              },
              "image"
            )
          ).map(({ _id }) => _id),
        },
      };
      if (!onlyValidated) {
        filterImages.uploader = user;
      }
    }
    if (onlyValidated) {
      filterImages.validated = true;
    }

    return shuffle(
      await ImageModel.find({
        active: true,
        ...filterImages,
      })
    );
  }

  @Authorized([ADMIN])
  @Query(() => [CategoryImageAssociation])
  async resultsCategoryImageAssociations() {
    return await CategoryImageAssociationModel.find({});
  }

  @Query(() => [Image])
  async notAnsweredImages(
    @Ctx() { user }: IContext,
    @Arg("onlyValidated", { defaultValue: true }) onlyValidated: boolean
  ) {
    return await this.notAnsweredImagesQuery(onlyValidated, user?._id);
  }

  @Authorized()
  @Mutation(() => [Image], { nullable: true })
  async answerCategoryImageAssociation(
    @Ctx() { user }: IContext,
    @Arg("data")
    { image, category, rejectedCategories }: CategoryImageAssociationAnswer,
    @Arg("onlyValidated", { defaultValue: true }) onlyValidated: boolean
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await CategoryImageAssociationModel.create({
      user: user._id,
      category,
      rejectedCategories,
      image,
    });

    setTimeout(async () => {
      const result = await CategoryImageAssociationModel.deleteMany({});
      if ((result?.deletedCount ?? 0) > 0)
        console.log("CategoryImageAssociation Reset");
    }, ms("5 seconds"));

    return await this.notAnsweredImagesQuery(onlyValidated, user._id);
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
