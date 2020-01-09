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
  TagCategoryAssociation,
  TagCategoryAssociationAnswer,
  TagCategoryAssociationModel,
} from "../entities/associations/tagCategoryAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Tag, TagModel } from "../entities/tag";
import { DateRange } from "../entities/utils/date";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => TagCategoryAssociation)
export class TagCategoryAssociationResolver {
  async notAnsweredTagQuery(user?: ObjectId) {
    const filterTags: {
      _id?: {
        $not: {
          $in: Ref<Tag>[];
        };
      };
    } = {};

    if (user) {
      filterTags._id = {
        $not: {
          $in: compact(
            (
              await TagCategoryAssociationModel.find(
                {
                  user,
                },
                "tag"
              )
            ).map(({ tag }) => tag)
          ),
        },
      };
    }

    return ((await TagModel.aggregate([
      {
        $match: {
          active: true,
          ...filterTags,
        },
      },
    ]).sample(1)) as Tag[])[0];
  }

  @Authorized([ADMIN])
  @Mutation(() => [TagCategoryAssociation])
  async resetTagCategoryAssociations(
    @Arg("user", () => ObjectIdScalar) user: ObjectId
  ) {
    await TagCategoryAssociationModel.deleteMany({
      user,
    });
    return await TagCategoryAssociationModel.find({
      user,
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => String)
  async csvResultsTagCategoryAssociations(
    @Arg("dateRange") { minDate, maxDate }: DateRange
  ) {
    try {
      const parser = new Parser({
        fields: [
          { value: "user", label: "Usuario" },
          { value: "type", label: "Tipo de usuario" },
          { value: "tag", label: "Etiqueta" },
          { value: "categoryChosen", label: "Categoría elegida" },
          { value: "rejectedCategories", label: "Categorías rechazadas" },
          { value: "updatedAt", label: "Fecha respuesta" },
          { value: "location", label: "Ubicación" },
          { value: "otherCategory", label: "Otra categoría" },
        ],
      });

      const data = await TagCategoryAssociationModel.find({
        updatedAt: {
          $gte: toDate(minDate),
          $lte: toDate(maxDate),
        },
      })
        .populate("user", "email type")
        .populate("tag", "name")
        .populate("categoryChosen", "name")
        .populate("rejectedCategories", "name");
      return parser.parse(
        data.map<{
          user: string;
          type: string;
          tag: string;
          categoryChosen: string;
          rejectedCategories: string;
          updatedAt: string;
          location: string;
          otherCategory: string;
        }>(
          ({
            user,
            tag,
            categoryChosen,
            rejectedCategories,
            updatedAt,
            location,
            otherCategoryInput,
          }) => {
            return {
              user: user && isDocument(user) ? user.email : "null",
              type:
                user && isDocument(user) ? userTypeToText(user.type) : "null",
              tag: tag && isDocument(tag) ? tag.name : "null",
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
        )
      );
    } catch (err) {
      console.error(90, err);
    }

    return "";
  }

  @Query(() => Tag, { nullable: true })
  async notAnsweredTag(@Ctx() { user }: IContext) {
    return await this.notAnsweredTagQuery(user?._id);
  }

  @Authorized()
  @Mutation(() => Tag, { nullable: true })
  async answerTagCategoryAssociation(
    @Ctx() { user }: IContext,
    @Arg("data", () => TagCategoryAssociationAnswer)
    {
      tag,
      categoryChosen,
      rejectedCategories,
      location,
      otherCategoryInput,
    }: TagCategoryAssociationAnswer
  ) {
    assertIsDefined(user, "Auth context is not working properly!");

    await TagCategoryAssociationModel.findOneAndUpdate(
      {
        user: user._id,
        tag,
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

    return await this.notAnsweredTagQuery(user._id);
  }

  @FieldResolver()
  async user(@Root() { user }: Partial<TagCategoryAssociation>) {
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
  async tag(@Root() { tag }: Partial<TagCategoryAssociation>) {
    if (tag) {
      if (isDocument(tag)) {
        return tag;
      } else {
        return await TagModel.findById(tag);
      }
    }
    return null;
  }

  @FieldResolver()
  async categoryChosen(
    @Root() { categoryChosen }: Partial<TagCategoryAssociation>
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
    @Root() { rejectedCategories }: Partial<TagCategoryAssociation>
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
    return [];
  }
}
