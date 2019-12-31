export const ADMIN = "admin";
export const LOCKED_USER = "locked_user";
export const WRONG_INFO = "wrong_info";
export const USED_OLD_PASSWORD = "used_old_password";
export const GRAPHQL_URL =
  typeof window === "undefined"
    ? `${process?.env?.DOMAIN ?? "http://localhost:3000"}/api/graphql`
    : "/api/graphql";
export const USER_ALREADY_EXISTS = "user_already_exists";
export enum UserType {
  scientificOrAcademic = "scientificOrAcademic",
  professional = "professional",
  student = "student",
  other = "other",
}
export enum GameType {
  Tag = "Tag",
  Image = "Image",
  Any = "Any",
}
export const imagePlaceholder = "/placeholder_image.png";
