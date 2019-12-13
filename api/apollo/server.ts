import { ApolloServer } from "apollo-server-express";
import { buildSchemaSync } from "type-graphql";

import * as resolvers from "../resolvers";
import { authChecker } from "./authChecker";
import { buildContext } from "./buildContext";

export const apolloServer = new ApolloServer({
  schema: buildSchemaSync({
    resolvers: [...Object.values(resolvers)],
    emitSchemaFile: true,
    validate: {
      validationError: {
        value: false,
      },
    },
    authChecker,
  }),
  playground: {
    settings: {
      "request.credentials": "include",
    },
  },
  context: ({ req, res }) => buildContext({ req, res }),
  introspection: true,
  debug: process.env.NODE_ENV !== "production",
});
