import { FieldResolver, Resolver, Root } from "type-graphql";

import { isDocumentArray } from "@typegoose/typegoose";

import { ImageModel } from "../entities/image";
import { TagModel } from "../entities/tag";
import { User } from "../entities/user";

@Resolver(() => User)
export class UserResolver {
  @FieldResolver()
  async imagesUploaded(@Root() { imagesUploaded }: Partial<User>) {
    if (imagesUploaded) {
      if (isDocumentArray(imagesUploaded)) {
        return imagesUploaded;
      } else {
        return await ImageModel.find({
          _id: {
            $in: imagesUploaded,
          },
        });
      }
    }
    return [];
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
