import { compact } from "lodash";
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
  async notAnsweredImageQuery(user?: ObjectId) {
    const filterImages: {
      validated?: true;
      _id?: {
        $not: {
          $in: Ref<Image>[];
        };
      };
      $or?: [
        {
          uploader: ObjectId;
        },
        {
          validated: true;
        }
      ];
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

      filterImages.$or = [
        {
          uploader: user,
        },
        {
          validated: true,
        },
      ];
    } else {
      filterImages.validated = true;
    }

    return ((await ImageModel.aggregate([
      {
        $match: {
          active: true,
          ...filterImages,
        },
      },
    ]).sample(1)) as Image[])[0];
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

  @Query(() => Image, { nullable: true })
  async notAnsweredImage(@Ctx() { user }: IContext) {
    return await this.notAnsweredImageQuery(user?._id);
  }

  @Authorized()
  @Mutation(() => Image, { nullable: true })
  async answerCategoryImageAssociation(
    @Ctx() { user }: IContext,
    @Arg("data")
    {
      image,
      categoryChosen,
      rejectedCategories,
    }: CategoryImageAssociationAnswer
  ) {
    assertIsDefined(user, "Auth context is not working properly!");
    await CategoryImageAssociationModel.findOneAndUpdate(
      {
        user: user._id,
        image,
      },
      {
        categoryChosen,
        rejectedCategories,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return await this.notAnsweredImageQuery(user._id);
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
  async categoryChosen(
    @Root()
    { categoryChosen }: Partial<CategoryImageAssociation>
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
        }).sort({
          name: "asc",
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
