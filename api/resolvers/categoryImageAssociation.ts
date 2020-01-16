import { toDate, utcToZonedTime } from "date-fns-tz";
import { Parser } from "json2csv";
import { compact } from "lodash";
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

import { isDocument, isDocumentArray, Ref } from "@typegoose/typegoose";

import { ADMIN } from "../../constants";
import { userTypeToText } from "../../constants/enums";
import {
  CategoryImageAssociation,
  CategoryImageAssociationAnswer,
  CategoryImageAssociationModel,
} from "../entities/associations/categoryImageAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Image, ImageModel } from "../entities/image";
import { DateRange } from "../entities/utils/date";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => CategoryImageAssociation)
export class CategoryImageAssociationResolver {
  async notAnsweredImageQuery({
    user,
    onlyOwnImages,
  }: {
    user?: ObjectId;
    onlyOwnImages: boolean;
  }) {
    const filterImages: {
      validated?: true;
      _id?: {
        $not: {
          $in: Ref<Image>[];
        };
      };
      uploader?: ObjectId;
    } = {};

    if (user) {
      filterImages._id = {
        $not: {
          $in: compact(
            (
              await CategoryImageAssociationModel.find(
                {
                  user,
                },
                "image"
              )
            ).map(({ image }) => image)
          ),
        },
      };

      if (onlyOwnImages) {
        filterImages.uploader = user;
      } else {
        filterImages.validated = true;
      }
    } else {
      filterImages.validated = true;
    }

    return ((await ImageModel.aggregate([
      {
        $match: {
          active: true,
          ...filterImages,
        },
      },
    ]).sample(1)) as Image[])[0];
  }

  @Authorized([ADMIN])
  @Mutation(() => [CategoryImageAssociation])
  async resetCategoryImageAssociations(
    @Arg("user", () => ObjectIdScalar) user: ObjectId
  ) {
    await CategoryImageAssociationModel.deleteMany({
      user,
    });
    return await CategoryImageAssociationModel.find({
      user,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => String)
  async csvResultsCategoryImageAssociations(
    @Arg("onlyValidatedImages") onlyValidatedImages: boolean,
    @Arg("dateRange") { minDate, maxDate }: DateRange
  ) {
    const parser = new Parser({
      fields: [
        { value: "user", label: "Usuario" },
        { value: "types", label: "Tipo de usuario" },
        { value: "image", label: "Imagen" },
        { value: "categoryChosen", label: "Categoría elegida" },
        { value: "rejectedCategories", label: "Categorías rechazadas" },
        { value: "updatedAt", label: "Fecha respuesta" },
        { value: "location", label: "Ubicación" },
        { value: "otherCategory", label: "Otra categoría" },
      ],
    });
    const dataRaw = await CategoryImageAssociationModel.find({
      updatedAt: {
        $gte: toDate(minDate),
        $lte: toDate(maxDate),
      },
    })
      .populate("user", "email types typeSpecify")
      .populate("categoryChosen", "name")
      .populate("rejectedCategories", "name")
      .populate("image", "filename validated");

    let processedData = dataRaw.map<{
      user: string;
      types: string;
      image: string;
      categoryChosen: string;
      rejectedCategories: string;
      updatedAt: string;
      location: string;
      otherCategory: string;
    }>(
      ({
        user,
        image,
        categoryChosen,
        rejectedCategories,
        updatedAt,
        location,
        otherCategoryInput,
      }) => {
        return {
          user: user && isDocument(user) ? user.email : "null",
          types:
            user && isDocument(user)
              ? `${user.types?.map(type => userTypeToText(type)).join("|")}${
                  user.typeSpecify ? " : " + user.typeSpecify : ""
                }`
              : "null",
          image:
            image &&
            isDocument(image) &&
            (onlyValidatedImages ? image.validated : true)
              ? `${process.env.DOMAIN ?? ""}/api/images/${image.filename}`
              : "null",
          categoryChosen:
            categoryChosen && isDocument(categoryChosen)
              ? categoryChosen.name
              : "null",
          rejectedCategories:
            rejectedCategories && isDocumentArray(rejectedCategories)
              ? rejectedCategories.map(({ name }) => name).join("-")
              : "null",
          updatedAt: utcToZonedTime(
            updatedAt,
            "America/Santiago"
          ).toLocaleString("es-CL"),
          location: location
            ? `lat:${location.latitude}|long:${location.longitude}`
            : "null",
          otherCategory: otherCategoryInput ?? "null",
        };
      }
    );
    if (onlyValidatedImages) {
      processedData = processedData.filter(({ image }) => {
        return image !== "null";
      });
    }
    return parser.parse(processedData);
  }

  @Query(() => Image, { nullable: true })
  async notAnsweredImage(
    @Ctx() { user }: IContext,
    @Arg("onlyOwnImages", { defaultValue: false }) onlyOwnImages: boolean
  ) {
    return await this.notAnsweredImageQuery({
      user: user?._id,
      onlyOwnImages,
    });
  }

  @Authorized()
  @Mutation(() => Image, { nullable: true })
  async answerCategoryImageAssociation(
    @Ctx() { user }: IContext,
    @Arg("data")
    {
      image,
      categoryChosen,
      rejectedCategories,
      location,
      otherCategoryInput,
    }: CategoryImageAssociationAnswer,
    @Arg("onlyOwnImages", { defaultValue: false }) onlyOwnImages: boolean
  ) {
    assertIsDefined(user, "Auth context is not working properly!");
    await CategoryImageAssociationModel.findOneAndUpdate(
      {
        user: user._id,
        image,
      },
      {
        categoryChosen,
        rejectedCategories,
        location,
        otherCategoryInput,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return await this.notAnsweredImageQuery({ user: user._id, onlyOwnImages });
  }

  @FieldResolver()
  async user(@Root() { user }: Partial<CategoryImageAssociation>) {
    if (user) {
      if (isDocument(user)) {
        return user;
      } else {
        return await UserModel.findById(user);
      }
    }
    return null;
  }

  @FieldResolver()
  async categoryChosen(
    @Root()
    { categoryChosen }: Partial<CategoryImageAssociation>
  ) {
    if (categoryChosen) {
      if (isDocument(categoryChosen)) {
        return categoryChosen;
      } else {
        return await CategoryModel.findById(categoryChosen);
      }
    }
    return null;
  }

  @FieldResolver()
  async rejectedCategories(
    @Root() { rejectedCategories }: Partial<CategoryImageAssociation>
  ) {
    if (rejectedCategories) {
      if (isDocumentArray(rejectedCategories)) {
        return rejectedCategories;
      } else {
        return await CategoryModel.find({
          _id: {
            $in: rejectedCategories,
          },
        }).sort({
          name: "asc",
        });
      }
    }
    return null;
  }

  @FieldResolver()
  async image(@Root() { image }: Partial<CategoryImageAssociation>) {
    if (image) {
      if (isDocument(image)) {
        return image;
      } else {
        return await ImageModel.findById(image);
      }
    }
    return null;
  }
}
