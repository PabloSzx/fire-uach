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

import { ADMIN } from "../../constants";
import { EditUser, User, UserModel } from "../entities/auth/user";
import { ImageModel } from "../entities/image";
import { TagAssociationModel } from "../entities/tags/tagAssociation";
import { TagImageAssociationModel } from "../entities/tags/tagImageAssociation";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => User)
export class UserResolver {
  @Authorized([ADMIN])
  @Query(() => [User])
  async allUsers() {
    return await UserModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async editUser(@Arg("data") { _id, ...user }: EditUser) {
    await UserModel.findByIdAndUpdate(_id, user, {
      new: true,
      setDefaultsOnInsert: true,
    });
    return await UserModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [User])
  async removeUser(@Arg("id", () => ObjectIdScalar) id: ObjectId) {
    await UserModel.findByIdAndRemove(id);

    return await UserModel.find({});
  }

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
}
