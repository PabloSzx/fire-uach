import { PromiseType } from "utility-types";

import { buildContext } from "../apollo/buildContext";

export type IContext = PromiseType<ReturnType<typeof buildContext>>;
