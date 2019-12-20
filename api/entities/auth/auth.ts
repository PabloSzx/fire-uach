import { IsHash } from "class-validator";
import { EmailAddressResolver as EmailAddress } from "graphql-scalars";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field(() => EmailAddress)
  email: string;

  @Field()
  @IsHash("sha256", { message: "password must be a hash" })
  password: string;
}

@InputType()
export class SignUpInput {
  @Field(() => EmailAddress)
  email: string;

  @Field()
  @IsHash("sha256", { message: "password must be a hash" })
  password: string;
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