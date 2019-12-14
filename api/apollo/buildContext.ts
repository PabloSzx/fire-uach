import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { Document } from "mongoose";

import { SECRET } from "../constants";
import { User, UserModel } from "../entities/user";
import { AuthResolver } from "../resolvers/auth";

export const buildContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}) => {
  let token: string | undefined;
  let user: (Document & User) | null = null;
  try {
    const authorizationToken: string | undefined =
      req.cookies.authorization || req.headers.authorization;
    if (authorizationToken) {
      const userJWT = verify(authorizationToken, SECRET) as { _id: string };
      const foundUser = await UserModel.findById(userJWT._id);
      if (foundUser && !foundUser.locked) {
        user = foundUser;
        token = AuthResolver.authenticate({
          req,
          res,
          _id: userJWT._id,
        });
      }
    }
  } catch (err) {}
  return {
    req,
    res,
    user,
    token,
  };
};
