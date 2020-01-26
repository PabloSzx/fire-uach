import { IsHash, Length } from "class-validator";
import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { Field, InputType } from "type-graphql";

import { UserType } from "../../../constants";
import { User } from "./user";

@InputType()
export class LoginInput implements Partial<User> {
  @Field(() => EmailAddress)
  email: string;

  @Field()
  @IsHash("sha256", { message: "password must be a hash" })
  password: string;
}

@InputType()
export class SignUpInput implements Partial<User> {
  @Field(() => EmailAddress)
  email: string;

  @Length(3, 30)
  @Field()
  username: string;

  @Field()
  @IsHash("sha256", { message: "password must be a hash" })
  password: string;

  @Field(() => [UserType])
  types: UserType[];

  @Field()
  typeSpecify: string;

  @Field()
  fireRelated: boolean;

  @Field()
  fireRelatedSpecify: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsHash("sha256", { message: "password must be a hash" })
  oldPassword: string;

  @Field()
  @IsHash("sha256", { message: "password must be a hash" })
  password: string;
}

@InputType()
export class UnlockInput extends LoginInput {
  @Field()
  unlockKey: string;
}
