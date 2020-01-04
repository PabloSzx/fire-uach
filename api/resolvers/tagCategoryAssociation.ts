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
import {
  TagCategoryAssociation,
  TagCategoryAssociationAnswer,
  TagCategoryAssociationModel,
} from "../entities/associations/tagCategoryAssociation";
import { UserModel } from "../entities/auth/user";
import { CategoryModel } from "../entities/category";
import { Tag, TagModel } from "../entities/tag";
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
  async csvResultsTagCategoryAssociations() {
    try {
      const parser = new Parser({
        fields: [
          { value: "user", label: "Usuario" },
          { value: "tag", label: "Etiqueta" },
          { value: "categoryChosen", label: "Categoría elegida" },
          { value: "rejectedCategories", label: "Categorías rechazadas" },
          { value: "updatedAt", label: "Fecha respuesta" },
        ],
      });

      const data = await TagCategoryAssociationModel.find({})
        .populate("user", "email")
        .populate("tag", "name")
        .populate("categoryChosen", "name")
        .populate("rejectedCategories", "name");
      return parser.parse(
        data.map<{
          user: string;
          tag: string;
          categoryChosen: string;
          rejectedCategories: string;
          updatedAt: string;
        }>(({ user, tag, categoryChosen, rejectedCategories, updatedAt }) => {
          return {
            user: user && isDocument(user) ? user.email : "null",
            tag: tag && isDocument(tag) ? tag.name : "null",
            categoryChosen:
              categoryChosen && isDocument(categoryChosen)
                ? categoryChosen.name
                : "null",
            rejectedCategories:
              rejectedCategories && isDocumentArray(rejectedCategories)
                ? rejectedCategories.map(({ name }) => name).join("-")
                : "null",
            updatedAt: updatedAt.toLocaleString("es-CL"),
          };
        })
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
    { tag, categoryChosen, rejectedCategories }: TagCategoryAssociationAnswer
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
