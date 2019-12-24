import assert, { AssertionError } from "assert";
import encodeUrl from "encodeurl";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { shuffle } from "lodash";
import mime from "mime";
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

import { isDocument } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { uploadFileGridFSStream } from "../db/gridFS";
import { UserModel } from "../entities/auth/user";
import { EditImage, Image, ImageModel, RemoveImage } from "../entities/image";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => Image)
export class ImageResolver {
  @Authorized()
  @Mutation(() => Image)
  async uploadImage(
    @Ctx() { user }: IContext,
    @Arg("file", () => GraphQLUpload) { createReadStream, filename }: FileUpload
  ) {
    assertIsDefined(user, `User context error!`);
    assert(
      filename,
      new AssertionError({
        message: "Imagen no válida!",
      })
    );
    const mimetype = mime.getType(filename);

    assertIsDefined(mimetype, "Tipo de imagen no válida!");

    const extension = mime.getExtension(mimetype);

    assertIsDefined(extension, "Extensión de imagen no válida!");

    switch (extension) {
      case "png":
      case "jpeg":
        break;
      default: {
        throw new AssertionError({
          message: "La imagen debe ser PNG o JPEG!",
        });
      }
    }

    filename = user._id.toHexString() + "_" + encodeUrl(filename);

    try {
      const imageDoc = await ImageModel.findOneAndUpdate(
        {
          filename,
        },
        {
          filename,
          mimetype,
          extension,
          uploader: user._id,
          active: true,
          validated: false,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      user.imagesUploaded = user.imagesUploaded?.concat(imageDoc._id) ?? [
        imageDoc._id,
      ];

      await Promise.all([
        uploadFileGridFSStream(createReadStream(), filename, imageDoc._id),
        user.save(),
      ]);
      return imageDoc;
    } catch (err) {
      console.error(40, err);
      throw err;
    }
  }

  @Query(() => Image, { nullable: true })
  async image(@Arg("id", () => ObjectIdScalar) id: ObjectId) {
    return await ImageModel.findById(id);
  }

  @Authorized([ADMIN])
  @Query(() => [Image])
  async images() {
    return await ImageModel.find({
      active: true,
    });
  }

  @Query(() => [Image])
  async validatedImages() {
    return await ImageModel.find({ validated: true, active: true });
  }

  @Authorized()
  @Query(() => Image, { nullable: true })
  async ownImages(@Ctx() { user }: IContext) {
    return await ImageModel.find({
      uploader: user?._id,
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Image])
  async editImage(@Arg("data") { _id, validated }: EditImage) {
    await ImageModel.findByIdAndUpdate(
      _id,
      {
        validated,
      },
      {
        select: "_id",
        setDefaultsOnInsert: true,
      }
    );

    return await ImageModel.find({
      active: true,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Image])
  async removeImage(@Arg("data") { _id }: RemoveImage) {
    await ImageModel.findByIdAndUpdate(
      _id,
      {
        active: false,
      },
      {
        setDefaultsOnInsert: true,
      }
    );

    return await ImageModel.find({
      active: true,
    });
  }

  @FieldResolver()
  async uploader(@Root() { uploader }: Partial<Image>) {
    if (uploader) {
      if (isDocument(uploader)) {
        return uploader;
      } else {
        return await UserModel.findById(uploader);
      }
    }
    return null;
  }
}
