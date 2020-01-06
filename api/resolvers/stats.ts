import {
  Authorized,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";

import { CategoryImageAssociationModel } from "../entities/associations/categoryImageAssociation";
import { TagCategoryAssociationModel } from "../entities/associations/tagCategoryAssociation";
import { ImageModel } from "../entities/image";
import { Stats } from "../entities/stats";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

@Resolver(() => Stats)
export class StatsResolver implements ResolverInterface<Stats> {
  @Authorized()
  @Query(() => Stats)
  async ownStats(@Ctx() { user }: IContext) {
    assertIsDefined(user, "Context user failed!");
    return {
      user,
    };
  }

  @FieldResolver()
  async nAssociatedImages(@Root() { user }: Pick<Stats, "user">) {
    const n = await CategoryImageAssociationModel.countDocuments({
      user: user._id,
    });

    return n;
  }

  @FieldResolver()
  async nAssociatedTags(@Root() { user }: Pick<Stats, "user">) {
    const n = await TagCategoryAssociationModel.countDocuments({
      user: user._id,
    });

    return n;
  }

  @FieldResolver()
  async nUploadedImages(@Root() { user }: Pick<Stats, "user">) {
    const n = await ImageModel.countDocuments({
      uploader: user._id,
      active: true,
    });

    return n;
  }

  @FieldResolver()
  async nValidatedUploadedImages(@Root() { user }: Pick<Stats, "user">) {
    const n = await ImageModel.countDocuments({
      uploader: user._id,
      active: true,
      validated: true,
    });

    return n;
  }
}
