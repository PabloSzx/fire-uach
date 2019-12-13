import { AuthChecker } from "type-graphql";

import { ADMIN } from "../../constants";
import { IContext } from "../interfaces";

export const authChecker: AuthChecker<IContext> = (
  { context: { user } },
  roles
) => {
  if (user) {
    for (const role of roles) {
      switch (role) {
        case ADMIN: {
          if (!user.admin) {
            return false;
          }
          break;
        }
        default:
          return false;
      }
    }
    return true;
  }

  return false;
};
