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
import { UserModel } from "../entities/auth/user";
import {
  EditImage,
  EditOwnImage,
  Image,
  ImageModel,
  RemoveImage,
} from "../entities/image";
import { CategoryModel } from "../entities/tags/category";
import { TagModel } from "../entities/tags/tag";
import { TagImageAssociationModel } from "../entities/tags/tagImageAssociation";
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
    return await ImageModel.find({});
  }

  @Query(() => [Image])
  async validatedImages() {
    return await ImageModel.find({ validated: true });
  }

  @Authorized()
  @Query(() => Image, { nullable: true })
  async ownImages(@Ctx() { user }: IContext) {
    return await ImageModel.find({
      uploader: user?._id,
    });
  }

  @Authorized()
  @Mutation(() => Image, { nullable: true })
  async editOwnImage(
    @Ctx() { user }: IContext,
    @Arg("data") { _id, categories }: EditOwnImage
  ) {
    if (user) {
      return await ImageModel.findOneAndUpdate(
        { _id, uploader: user._id },
        {
          categories,
        },
        {
          new: true,
        }
      );
    }
    return null;
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
  async categoriesNotAnswered(
    @Ctx() { user }: IContext,
    @Root() { _id, categories }: Partial<Image>
  ) {
    if (_id && categories) {
      const answeredCategories = (user
        ? await TagImageAssociationModel.find(
            {
              user: user._id,
              image: _id,
            },
            "category"
          )
        : []
      ).map(({ category }) => category);
      return await CategoryModel.find({
        $and: [
          {
            _id: {
              $not: {
                $in: answeredCategories,
              },
            },
          },
          {
            _id: {
              $in: categories,
            },
          },
        ],
      });
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
