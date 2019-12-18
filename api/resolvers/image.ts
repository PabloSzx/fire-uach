import assert, { AssertionError } from "assert";
import encodeUrl from "encodeurl";
import { FileUpload, GraphQLUpload } from "graphql-upload";
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

import { isDocument, isDocumentArray } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { removeFileGridFS, uploadFileGridFSStream } from "../db/gridFS";
import { CategoryModel } from "../entities/category";
import { EditImage, Image, ImageModel, RemoveImage } from "../entities/image";
import { TagModel } from "../entities/tag";
import { UserModel } from "../entities/user";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";

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
        throw new AssertionError({ message: "La imagen debe ser PNG o JPEG!" });
      }
    }

    filename = encodeUrl(filename);

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

  @Authorized([ADMIN])
  @Query(() => [Image])
  async images() {
    return await ImageModel.find({});
  }

  @Query(() => [Image])
  async validatedImages() {
    return await ImageModel.find({ validated: true });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Image])
  async editImage(@Arg("data") { _id, validated, categories }: EditImage) {
    await ImageModel.findByIdAndUpdate(
      _id,
      {
        validated,
        categories,
      },
      {
        select: "_id",
        setDefaultsOnInsert: true,
      }
    );

    return await ImageModel.find({});
  }

  @Authorized([ADMIN])
  @Mutation(() => [Image])
  async removeImage(@Arg("data") { _id }: RemoveImage) {
    await Promise.all([
      ImageModel.findByIdAndRemove(_id),
      removeFileGridFS(_id),
    ]);

    return await ImageModel.find({});
  }

  @FieldResolver()
  async possibleTags(@Root() { categories }: Partial<Image>) {
    if (categories && !isDocumentArray(categories)) {
      const tags: ObjectId[] = await CategoryModel.find({
        _id: {
          $in: categories,
        },
      }).distinct("tags");

      // TODO: Check if works

      return await TagModel.find({
        _id: {
          $in: tags,
        },
      });
    }

    return [];
  }

  @FieldResolver()
  async categories(@Root() { categories }: Partial<Image>) {
    if (categories) {
      if (isDocumentArray(categories)) {
        return categories;
      } else {
        return await CategoryModel.find({
          _id: {
            $in: categories,
          },
        });
      }
    }

    return [];
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
