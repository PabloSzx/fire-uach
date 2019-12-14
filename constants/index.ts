export const ADMIN = "admin";
export const LOCKED_USER = "locked_user";
export const WRONG_INFO = "wrong_info";
export const USED_OLD_PASSWORD = "used_old_password";
export const GRAPHQL_URL =
  typeof window === "undefined"
    ? `${process?.env?.DOMAIN ?? "http://localhost:3000"}/api/graphql`
    : "/api/graphql";
export const USER_ALREADY_EXISTS = "user_already_exists";
