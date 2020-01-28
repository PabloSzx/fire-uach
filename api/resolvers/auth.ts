import { addMilliseconds, differenceInHours } from "date-fns";
import { Request, Response } from "express";
import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { sign } from "jsonwebtoken";
import ms from "ms";
import { generate } from "randomstring";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { LOCKED_USER, USER_ALREADY_EXISTS, WRONG_INFO } from "../../constants";
import { SECRET } from "../constants";
import {
  ChangePasswordInput,
  LoginInput,
  SignUpInput,
  UnlockInput,
} from "../entities/auth/auth";
import { User, UserModel } from "../entities/auth/user";
import { IContext } from "../interfaces";
import { assertIsDefined } from "../utils/assert";
import { sendMail, UnlockMail } from "../utils/mail";

@Resolver()
export class AuthResolver {
  static authenticate({
    req,
    res,
    _id,
  }: {
    req: Request;
    res: Response;
    _id: string;
  }) {
    const token = sign(
      {
        _id,
      },
      SECRET,
      {
        expiresIn: "1 week",
      }
    );
    res.cookie("authorization", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: addMilliseconds(Date.now(), ms("1 week")),
    });
    return token;
  }

  @Query(() => User, { nullable: true })
  async currentUser(@Ctx() { user }: IContext) {
    if (user) {
      return user;
    }
    return null;
  }

  @Mutation(() => User)
  async login(
    @Ctx() { req, res }: IContext,
    @Arg("data") { email, password }: LoginInput
  ): Promise<User> {
    const user = await UserModel.findOne({ email, active: true });

    if (user?.locked) {
      throw new Error(LOCKED_USER);
    } else if (user?.password === password) {
      AuthResolver.authenticate({
        req,
        res,
        _id: user._id,
      });

      return user;
    } else {
      throw new Error(WRONG_INFO);
    }
  }

  @Mutation(() => User)
  async signUp(
    @Ctx() { req, res }: IContext,
    @Arg("data")
    {
      email,
      username,
      password,
      types,
      typeSpecify,
      fireRelated,
      fireRelatedSpecify,
    }: SignUpInput
  ) {
    let user = await UserModel.findOne({
      email,
    });

    if (user === null) {
      user = await UserModel.create({
        email,
        username,
        password,
        types,
        typeSpecify,
        fireRelated,
        fireRelatedSpecify,
      });
      AuthResolver.authenticate({
        req,
        res,
        _id: user._id,
      });
      return user;
    } else if (!user.active) {
      user.username = username;
      user.types = types;
      user.typeSpecify = typeSpecify;
      user.fireRelated = fireRelated;
      user.fireRelatedSpecify = fireRelatedSpecify;
      user.active = true;
      user.password = password;
      await user.save();
      AuthResolver.authenticate({
        req,
        res,
        _id: user._id,
      });
      return user;
    }
    throw new Error(USER_ALREADY_EXISTS);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { user, res }: IContext) {
    if (user) {
      res.clearCookie("authorization");
      return true;
    }
    return false;
  }

  @Mutation(() => User)
  async unlock(
    @Ctx() { req, res }: IContext,
    @Arg("data") { email, password, unlockKey }: UnlockInput
  ): Promise<User> {
    const user = await UserModel.findOne({
      email,
      unlockKey,
      active: true,
    });

    if (!user) {
      throw new Error(WRONG_INFO);
    } else if (user.locked) {
      throw new Error(LOCKED_USER);
    } else {
      user.password = password;
      user.locked = false;
      user.unlockKey = "";
      await user.save();

      AuthResolver.authenticate({
        req,
        res,
        _id: user._id,
      });

      return user;
    }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email", () => EmailAddress) email: string
  ): Promise<boolean> {
    const user = await UserModel.findOne({ email });
    if (!user || !user.active || user.locked) {
      return false;
    }

    const now = new Date();

    if (user.lastEmailSent && differenceInHours(now, user.lastEmailSent) < 1) {
      return true;
    }

    try {
      const unlockKey = generate();
      user.lastEmailSent = now;
      user.unlockKey = unlockKey;
      await user.save();
      await sendMail({
        to: email,
        html: UnlockMail({
          email,
          unlockKey,
        }),
        subject: "Recuperación de cuenta FireSeS e-ncendio",
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  @Authorized()
  @Mutation(() => User)
  async changePassword(
    @Ctx() { req, res, user }: IContext,
    @Arg("data") { password, oldPassword }: ChangePasswordInput
  ) {
    assertIsDefined(user, `User authorization context error!`);

    if (oldPassword === user.password) {
      user.password = password;
      await user.save();
      AuthResolver.authenticate({
        req,
        res,
        _id: user._id,
      });

      return user;
    } else {
      throw new Error(WRONG_INFO);
    }
  }
}
