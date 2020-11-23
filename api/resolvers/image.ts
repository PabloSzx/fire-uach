import assert, { AssertionError } from "assert";
import encodeUrl from "encodeurl";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import imageMin from "imagemin";
import imageMinJpegtran from "imagemin-jpegtran";
import imageMinPngquant from "imagemin-pngquant";
import mime from "mime";
import { ObjectId } from "mongodb";
import { Document } from "mongoose";
import sharp from "sharp";
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
import { readFileGridFS, uploadFileGridFSBuffer } from "../db/gridFS";
import { UserModel } from "../entities/auth/user";
import { EditImage, Image, ImageModel, RemoveImage } from "../entities/image";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => Image)
export class ImageResolver {
  @Authorized()
  @Mutation(() => [Image])
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

    const chunks: Uint8Array[] = [];
    for await (let chunk of createReadStream()) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const image = sharp(fileBuffer);

    const { size, width, height } = await image.metadata();

    try {
      const imageDoc = await ImageModel.findOneAndUpdate(
        {
          filename,
        },
        {
          mimetype,
          extension,
          uploader: user._id,
          active: true,
          validated: false,
          size,
          width,
          height,
          uploadedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      let resizedImage: Buffer | undefined;

      if (width && width > 1920) {
        resizedImage = await image.resize(1920).toBuffer();
      }

      const optimizedImage = await imageMin.buffer(resizedImage || fileBuffer, {
        plugins: [
          imageMinJpegtran(),
          imageMinPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      });
      await Promise.all([
        uploadFileGridFSBuffer(optimizedImage, filename, imageDoc._id),
        new Promise<void>(async (resolve, reject) => {
          try {
            const { size, width, height } = await sharp(
              optimizedImage
            ).metadata();
            imageDoc.size = size;
            imageDoc.width = width;
            imageDoc.height = height;
            await imageDoc.save();
            resolve();
          } catch (err) {
            reject(err);
          }
        }),
      ]);
      return await ImageModel.find({
        uploader: user._id,
        active: true,
      }).sort({
        updatedAt: "desc",
      });
    } catch (err) {
      console.error(40, err);
      throw err;
    }
  }

  @Authorized([ADMIN])
  @Mutation(() => [Image])
  async optimizeImages(
    @Arg("_ids", () => [ObjectIdScalar], { nullable: true }) _ids?: ObjectId[]
  ) {
    const optimizedImages: (Document & Image)[] = [];

    for (const id of _ids ||
      (
        await ImageModel.find(
          {
            active: true,
          },
          "_id"
        )
      ).map(({ _id }) => _id)) {
      const [imageDoc, fileGridFS] = await Promise.all([
        ImageModel.findById(id),
        readFileGridFS({
          _id: id,
        }),
      ]);
      assertIsDefined(imageDoc, "Image doc not found!");
      assertIsDefined(fileGridFS, "Image file not found!");

      const chunks: Uint8Array[] = [];
      for await (let chunk of fileGridFS) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);

      const image = sharp(fileBuffer);

      const oldMetadata = await image.metadata();

      let resizedImage: Buffer | undefined;

      if (oldMetadata.width && oldMetadata.width > 1920) {
        resizedImage = await image.resize(1920).toBuffer();
      } else {
        continue;
      }

      const optimizedImage = await imageMin.buffer(resizedImage, {
        plugins: [
          imageMinJpegtran({
            progressive: true,
          }),
          imageMinPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      });

      const { size, width, height } = await sharp(optimizedImage).metadata();
      imageDoc.size = size;
      imageDoc.width = width;
      imageDoc.height = height;

      await Promise.all([
        imageDoc.save(),
        uploadFileGridFSBuffer(optimizedImage, imageDoc.filename, imageDoc._id),
      ]);

      optimizedImages.push(imageDoc);
    }
    return optimizedImages;
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
    }).sort({
      updatedAt: "desc",
    });
  }

  @Query(() => [Image])
  async validatedImages() {
    return await ImageModel.find({ validated: true, active: true }).sort({
      updatedAt: "desc",
    });
  }

  @Authorized()
  @Query(() => [Image])
  async ownImages(@Ctx() { user }: IContext) {
    return await ImageModel.find({
      uploader: user?._id,
      active: true,
    }).sort({
      updatedAt: "desc",
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
    }).sort({
      updatedAt: "desc",
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
    }).sort({
      updatedAt: "desc",
    });
  }

  @FieldResolver()
  async uploadedAt(@Root() { uploadedAt, createdAt, _id }: Partial<Image>) {
    if (!uploadedAt) {
      ImageModel.findByIdAndUpdate(_id, {
        uploadedAt: createdAt as Date,
      })
        .then(() => {})
        .catch(() => {});
      return createdAt;
    }
    return uploadedAt;
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
