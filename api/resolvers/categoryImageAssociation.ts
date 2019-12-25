import { compact, shuffle } from "lodash";
import { ObjectId } from "mongodb";
import ms from "ms";
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
  CategoryImageAssociation,
  CategoryImageAssociationAnswer,
  CategoryImageAssociationModel,
} from "../entities/associations/categoryImageAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Image, ImageModel } from "../entities/image";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => CategoryImageAssociation)
export class CategoryImageAssociationResolver {
  async notAnsweredImagesQuery(onlyValidated: boolean, user?: ObjectId) {
    const filterImages: {
      validated?: boolean;
      uploader?: ObjectId;
      _id?: {
        $not: {
          $in: Ref<Image>[];
        };
      };
    } = {};

    if (user) {
      filterImages._id = {
        $not: {
          $in: compact(
            (
              await CategoryImageAssociationModel.find(
                {
                  user,
                },
                "image"
              )
            ).map(({ image }) => image)
          ),
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
  @Mutation(() => [CategoryImageAssociation])
  async resetCategoryImageAssociations(
    @Arg("user", () => ObjectIdScalar) user: ObjectId
  ) {
    await CategoryImageAssociationModel.deleteMany({
      user,
    });
    return await CategoryImageAssociationModel.find({
      user,
    });
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
    @Arg("onlyValidated") onlyValidated: boolean
  ) {
    assertIsDefined(user, "Auth context is not working properly!");
    await CategoryImageAssociationModel.findOneAndUpdate(
      {
        user: user._id,
        image,
      },
      {
        category,
        rejectedCategories,
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (process.env.NODE_ENV === "developmentzxc") {
      setTimeout(async () => {
        const result = await CategoryImageAssociationModel.deleteMany({});
        if ((result?.deletedCount ?? 0) > 0)
          console.log("CategoryImageAssociation Reset");
      }, ms("5 seconds"));
    }

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
        return await CategoryModel.find({
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
