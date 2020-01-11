import { ObjectId } from "mongodb";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";

import { isDocument, Ref } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { CategoryImageAssociationModel } from "../entities/associations/categoryImageAssociation";
import { TagCategoryAssociationModel } from "../entities/associations/tagCategoryAssociation";
import { User, UserModel } from "../entities/auth/user";
import { ImageModel } from "../entities/image";
import { UserStats, UserStatsModel } from "../entities/stats";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => UserStats)
export class UserStatsResolver implements ResolverInterface<UserStats> {
  static async updateScore(user: Ref<User>, score: number) {
    const newStats = await UserStatsModel.findOneAndUpdate(
      {
        user: isDocument(user) ? user._id : user,
      },
      {
        $inc: {
          score,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  @Authorized([ADMIN])
  @Query(() => UserStats, { nullable: true })
  async userStats(@Arg("user_id", () => ObjectIdScalar) user_id: ObjectId) {
    const user = await UserModel.findById(user_id);

    if (user) {
      return await UserStatsModel.findOneAndUpdate(
        {
          user: user._id,
        },
        {},
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    return null;
  }

  @Authorized()
  @Query(() => UserStats)
  async ownStats(@Ctx() { user }: IContext) {
    assertIsDefined(user, "Context user failed!");
    return await UserStatsModel.findOneAndUpdate(
      {
        user: user._id,
      },
      {},
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  @FieldResolver()
  async nAssociatedImages(
    @Root() { user, _id }: Pick<UserStats, "user" | "_id">
  ) {
    if (!user) {
      return 0;
    }
    const n = await CategoryImageAssociationModel.countDocuments({
      user: isDocument(user) ? user._id : user,
    });

    UserStatsModel.findByIdAndUpdate(_id, { nAssociatedImages: n })
      .then(() => {})
      .catch(err => {
        console.error(err);
      });

    return n;
  }

  @FieldResolver()
  async nAssociatedTags(
    @Root() { user, _id }: Pick<UserStats, "user" | "_id">
  ) {
    if (!user) {
      return 0;
    }
    const n = await TagCategoryAssociationModel.countDocuments({
      user: isDocument(user) ? user._id : user,
    });

    UserStatsModel.findByIdAndUpdate(_id, { nAssociatedTags: n })
      .then(() => {})
      .catch(err => {
        console.error(err);
      });

    return n;
  }

  @FieldResolver()
  async nUploadedImages(
    @Root() { user, _id }: Pick<UserStats, "user" | "_id">
  ) {
    if (!user) {
      return 0;
    }
    const n = await ImageModel.countDocuments({
      uploader: isDocument(user) ? user._id : user,
      active: true,
    });

    UserStatsModel.findByIdAndUpdate(_id, { nUploadedImages: n })
      .then(() => {})
      .catch(err => {
        console.error(err);
      });

    return n;
  }

  @FieldResolver()
  async nValidatedUploadedImages(
    @Root() { user, _id }: Pick<UserStats, "user" | "_id">
  ) {
    if (!user) {
      return 0;
    }
    const n = await ImageModel.countDocuments({
      uploader: isDocument(user) ? user._id : user,
      active: true,
      validated: true,
    });

    UserStatsModel.findByIdAndUpdate(_id, { nValidatedUploadedImages: n })
      .then(() => {})
      .catch(err => {
        console.error(err);
      });

    return n;
  }
}
