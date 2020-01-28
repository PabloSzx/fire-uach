import { orderBy } from "lodash";
import { ObjectId } from "mongodb";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
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

let userAdmins: ObjectId[] | undefined = undefined;

/**
 *  This level function pretends to represent
 *  level 1 ~> 0 score;
 *  level 2 ~> 5 score;
 *  level 3 ~> 15 score;
 *  level 4 ~> 27 score;
 *  level 5 ~> (level 4 score + (level 4 score - level 3 score) * 1.2) = 41 score;
 *  level y ~> x score;
 *
 * @param {number} score score
 * @param {number} m m in function
 * @param {number} b b in function
 * @returns {number} level
 */
const levelFunction = (
  score: number,
  m: number = 1.15,
  b: number = 0.0796
): number => {
  const level = Math.round(b + Math.log(m * score));
  return level >= 1 ? level : 1;
};

@Resolver(() => UserStats)
export class UserStatsResolver {
  static async updateUserStats({ user }: { user: Ref<User> }) {
    assertIsDefined(user, "User should be specified if stats is not given");
    const stats = await UserStatsModel.findOneAndUpdate(
      {
        user: isDocument(user) ? user._id : user,
      },
      {},
      {
        setDefaultsOnInsert: true,
        upsert: true,
        new: true,
      }
    );

    [
      stats.nAssociatedImages,
      stats.nAssociatedTags,
      stats.nUploadedImages,
      stats.nValidatedUploadedImages,
    ] = await Promise.all([
      CategoryImageAssociationModel.countDocuments({
        user: isDocument(user) ? user._id : user,
      }),
      TagCategoryAssociationModel.countDocuments({
        user: isDocument(user) ? user._id : user,
      }),
      ImageModel.countDocuments({
        uploader: isDocument(user) ? user._id : user,
        active: true,
      }),
      ImageModel.countDocuments({
        uploader: isDocument(user) ? user._id : user,
        active: true,
        validated: true,
      }),
    ]);

    stats.score =
      stats.nValidatedUploadedImages * 10 +
      stats.nAssociatedTags * 2 +
      stats.nAssociatedImages * 2 +
      stats.nUploadedImages * 5;

    stats.imagesLevel = levelFunction(stats.nAssociatedImages);

    stats.tagsLevel = levelFunction(stats.nAssociatedTags);

    stats.uploadLevel = levelFunction(
      stats.nUploadedImages + stats.nValidatedUploadedImages
    );

    stats.overallLevel = levelFunction(stats.score, 0.8);

    await stats.save();

    return stats;
  }

  @Authorized([ADMIN])
  @Query(() => UserStats, { nullable: true })
  async userStats(@Arg("user_id", () => ObjectIdScalar) user_id: ObjectId) {
    const user = await UserModel.findById(user_id);

    if (user) {
      return await UserStatsResolver.updateUserStats({ user });
    }

    return null;
  }

  @Authorized()
  @Query(() => [UserStats])
  async rankingStats(
    @Arg("limit", () => Int, { defaultValue: 5 }) limit: number
  ) {
    if (userAdmins === undefined) {
      userAdmins = (await UserModel.find({ admin: true })).map(
        ({ _id }) => _id
      );
    }
    let ranking = await UserStatsModel.find(
      {
        score: {
          $gt: 0,
        },
        user: {
          $not: {
            $in: userAdmins,
          },
        },
      },
      "user"
    )
      .limit(limit)
      .sort({
        score: "desc",
      });

    ranking = await Promise.all(
      ranking
        .filter(({ user }) => user)
        .map(({ user }) => {
          assertIsDefined(user, "filter is not working");
          return UserStatsResolver.updateUserStats({ user });
        })
    );

    return orderBy(
      ranking,
      ["overallLevel", "score", "email"],
      ["desc", "desc", "asc"]
    );
  }

  @Authorized()
  @Query(() => UserStats)
  async ownStats(@Ctx() { user }: IContext) {
    assertIsDefined(user, "Context user failed!");
    return await UserStatsResolver.updateUserStats({ user });
  }

  @FieldResolver()
  async user(@Root() { user }: Pick<UserStats, "user">) {
    return isDocument(user) ? user : await UserModel.findById(user);
  }

  @FieldResolver()
  async rankingPosition(@Root() { user }: Pick<UserStats, "user">) {
    if (userAdmins === undefined) {
      userAdmins = (await UserModel.find({ admin: true })).map(
        ({ _id }) => _id
      );
    }

    let ranking = await UserStatsModel.find(
      {
        score: {
          $gt: 0,
        },
        user: {
          $not: {
            $in: userAdmins,
          },
        },
      },
      "user"
    ).sort({
      score: "desc",
    });

    const userId = isDocument(user) ? user._id : user;

    const position = ranking.findIndex(stats => {
      return userId.equals(stats.user);
    });

    return position;
  }
}
