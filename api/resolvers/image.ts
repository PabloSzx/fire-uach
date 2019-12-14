import assert, { AssertionError } from "assert";
import encodeUrl from "encodeurl";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import mime from "mime";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { uploadFileGridFSStream } from "../db/gridFS";
import { Image, ImageModel } from "../entities/image";
import { assertIsDefined } from "../utils/assert";

@Resolver()
export class ImageResolver {
  @Mutation(() => Image)
  async uploadImage(
    @Arg("file", () => GraphQLUpload) { createReadStream, filename }: FileUpload
  ) {
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
        },
        {
          new: true,
          upsert: true,
        }
      );

      await uploadFileGridFSStream(createReadStream(), filename, imageDoc._id);
      return imageDoc;
    } catch (err) {
      console.error(40, err);
      throw err;
    }
  }

  @Query(() => [Image])
  async validatedImages() {
    return await ImageModel.find({ validated: true });
  }
}
