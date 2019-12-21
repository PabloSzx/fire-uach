import "dotenv/config";
import "reflect-metadata";
import "./db";

import cookieParser from "cookie-parser";
import express from "express";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import mongoose from "mongoose";

import { apolloServer } from "./apollo/server";
import { ImagesRouter } from "./routes/images";

const app = express();

app.use(cookieParser());

app.use("/api/voyager", voyagerMiddleware({ endpointUrl: "/api/graphql" }));

app.use("/api/images", ImagesRouter);

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

process.on("SIGINT", () => {
  mongoose.disconnect(err => {
    if (err) {
      console.error("Error on mongoose disconnection!", err);
    }
    process.exit(err ? 1 : 0);
  });
});
