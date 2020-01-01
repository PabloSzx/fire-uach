import { ObjectId } from "mongodb";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { ADMIN } from "../../constants";
import { CreateTip, EditTip, Tip, TipModel } from "../entities/tip";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { ObjectIdScalar } from "../utils/ObjectIdScalar";

@Resolver(() => Tip)
export class TipResolver {
  @Authorized()
  @Query(() => Tip, { nullable: true })
  async tip(@Ctx() { user }: IContext) {
    assertIsDefined(user, "User context failed");

    const possibleTip = await TipModel.find({
      _id: {
        $not: {
          $in: user.readTips,
        },
      },
    })
      .sort({
        priority: "desc",
      })
      .limit(1);

    if (possibleTip[0]) {
      user.readTips = [...user.readTips, possibleTip[0]._id];
      user
        .save()
        .then(() => {})
        .catch(() => {});
    }

    return possibleTip[0] ?? (await TipModel.aggregate().sample(1))[0];
  }

  @Authorized([ADMIN])
  @Query(() => [Tip])
  async allTips() {
    return await TipModel.find({}).sort({
      priority: "desc",
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tip])
  async createTip(@Arg("data") { text }: CreateTip) {
    await TipModel.findOneAndUpdate(
      {
        text,
      },
      {},
      {
        upsert: true,
      }
    );

    return await TipModel.find({}).sort({
      priority: "desc",
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tip])
  async editTip(@Arg("data") { _id, text, priority }: EditTip) {
    await TipModel.findOneAndUpdate(
      {
        _id,
      },
      {
        text,
        priority,
      },
      {
        upsert: true,
      }
    );

    return await TipModel.find({}).sort({
      priority: "desc",
    });
  }

  @Authorized([ADMIN])
  @Mutation(() => [Tip])
  async removeTip(@Arg("_id", () => ObjectIdScalar) _id: ObjectId) {
    await TipModel.findByIdAndRemove(_id);

    return await TipModel.find({}).sort({
      priority: "desc",
    });
  }
}
