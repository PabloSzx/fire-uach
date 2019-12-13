import { addMilliseconds } from "date-fns";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import ms from "ms";
import { Query, Resolver } from "type-graphql";

import { SECRET } from "../../constants";
import { User } from "../entities/user";

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
  async currentUser() {
    return null;
  }
}
