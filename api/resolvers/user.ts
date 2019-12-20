import { FieldResolver, Resolver, Root } from "type-graphql";

import { User } from "../entities/auth/user";
import { ImageModel } from "../entities/image";
import { TagModel } from "../entities/tags/tag";
import { TagAssociationModel } from "../entities/tags/tagAssociation";
import { TagImageAssociationModel } from "../entities/tags/tagImageAssociation";

@Resolver(() => User)
export class UserResolver {
  @FieldResolver()
  async imagesUploaded(@Root() { _id }: Pick<User, "_id">) {
    return await ImageModel.find({
      uploader: _id,
    });
  }

  @FieldResolver()
  async tagAssociations(@Root() { _id }: Pick<User, "_id">) {
    return await TagAssociationModel.find({
      user: _id,
    });
  }

  @FieldResolver()
  async tagImageAssociations(@Root() { _id }: Pick<User, "_id">) {
    return await TagImageAssociationModel.find({
      user: _id,
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
