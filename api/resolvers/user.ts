import { FieldResolver, Resolver, Root } from "type-graphql";

import { ImageModel } from "../entities/image";
import { TagModel } from "../entities/tag";
import { User } from "../entities/user";

@Resolver(() => User)
export class UserResolver {
  @FieldResolver()
  async imagesUploaded(@Root() { _id }: Pick<User, "_id">) {
    return await ImageModel.find({
      uploader: _id,
    });
  }

  @FieldResolver()
  async notAssociatedImages() {
    // TODO: Filter
    return await ImageModel.find({});
  }

  @FieldResolver()
  async notAssociatedTags() {
    // TODO: Filter
    return await TagModel.find({});
  }
}
