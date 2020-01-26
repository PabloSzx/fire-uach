import { ObjectId } from "mongodb";
import {
  Arg,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { isDocumentArray } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { CategoryImageAssociationModel } from "../entities/associations/categoryImageAssociation";
import { TagCategoryAssociationModel } from "../entities/associations/tagCategoryAssociation";
import { EditUser, User, UserModel } from "../entities/auth/user";
import { ImageModel } from "../entities/image";
import { TipModel } from "../entities/tip";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => User)
export class UserResolver {
  @Authorized([ADMIN])
  @Query(() => [User])
  async allUsers() {
    return await UserModel.find({ active: true });
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async editUser(@Arg("data") { _id, ...user }: EditUser) {
    await UserModel.findByIdAndUpdate(_id, user, {
      new: true,
      setDefaultsOnInsert: true,
    });
    return await UserModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async removeUser(@Arg("id", () => ObjectIdScalar) id: ObjectId) {
    await UserModel.findByIdAndUpdate(id, {
      active: false,
    });

    return await UserModel.find({
      active: true,
    });
  }

  @FieldResolver()
  async username(@Root() { email, username }: Partial<User>) {
    return username ?? email?.split("@")[0] ?? "default";
  }

  @FieldResolver()
  async types(@Root() { types }: Partial<User>) {
    return types || [];
  }

  @FieldResolver()
  async imagesUploaded(@Root() { _id }: Pick<User, "_id">) {
    return await ImageModel.find({
      uploader: _id,
      active: true,
    });
  }

  @FieldResolver()
  async tagCategoryAssociations(@Root() { _id }: Pick<User, "_id">) {
    return await TagCategoryAssociationModel.find({
      user: _id,
    });
  }

  @FieldResolver()
  async categoryImageAssociations(@Root() { _id }: Pick<User, "_id">) {
    return await CategoryImageAssociationModel.find({
      user: _id,
    });
  }

  @FieldResolver()
  async readTips(@Root() { readTips }: Pick<User, "readTips">) {
    return isDocumentArray(readTips)
      ? readTips
      : await TipModel.find({
          _id: {
            $in: readTips,
          },
        }).sort({
          priority: "desc",
        });
  }
}
