import "dotenv/config";
import "reflect-metadata";
import "./db";

import cookieParser from "cookie-parser";
import express from "express";

import { apolloServer } from "./apollo/server";

const app = express();

app.use(cookieParser());

apolloServer.applyMiddleware({
  app,
  path: "/api/graphql",
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 4005;

app.listen(
  {
    port,
  },
  () => {
    process.send?.("ready");
    console.log(
      `🚀 API Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
    );
  }
);
