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

import { ADMIN } from "../../constants";
import { CategoryImageAssociationModel } from "../entities/associations/categoryImageAssociation";
import { TagCategoryAssociationModel } from "../entities/associations/tagCategoryAssociation";
import { UserModel } from "../entities/auth/user";
import { ImageModel } from "../entities/image";
import { UserStats } from "../entities/stats";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => UserStats)
export class UserStatsResolver implements ResolverInterface<UserStats> {
  @Authorized([ADMIN])
  @Query(() => UserStats, { nullable: true })
  async userStats(@Arg("_id", () => ObjectIdScalar) _id: ObjectId) {
    const user = await UserModel.findById(_id);

    if (user) {
      return { _id, user };
    }

    return null;
  }

  @Authorized()
  @Query(() => UserStats)
  async ownStats(@Ctx() { user }: IContext) {
    assertIsDefined(user, "Context user failed!");
    return {
      _id: user._id,
      user,
    };
  }

  @FieldResolver()
  async nAssociatedImages(@Root() { user }: Pick<UserStats, "user">) {
    const n = await CategoryImageAssociationModel.countDocuments({
      user: user._id,
    });

    return n;
  }

  @FieldResolver()
  async nAssociatedTags(@Root() { user }: Pick<UserStats, "user">) {
    const n = await TagCategoryAssociationModel.countDocuments({
      user: user._id,
    });

    return n;
  }

  @FieldResolver()
  async nUploadedImages(@Root() { user }: Pick<UserStats, "user">) {
    const n = await ImageModel.countDocuments({
      uploader: user._id,
      active: true,
    });

    return n;
  }

  @FieldResolver()
  async nValidatedUploadedImages(@Root() { user }: Pick<UserStats, "user">) {
    const n = await ImageModel.countDocuments({
      uploader: user._id,
      active: true,
      validated: true,
    });

    return n;
  }
}
