import "express-async-errors";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./router";
import { NotFoundError } from "./errors/not-found-error";
import { CustomError } from "./errors/custom-error";
import { deserializeUser } from "./middleware/deserializeUser";
import { UserAuth } from "../common.types";

declare global {
  namespace Express {
    interface Locals {
      currentUser?: UserAuth;
    }
  }
}

const app: Express = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));

app.use(deserializeUser);
app.use("/api", router);
// handle 404
app.use((req, res, next) => {
  throw new NotFoundError();
});
//handle error
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .send({ errors: error.serializeErrors() });
  }
  console.log(error);
  return res.status(400).send({
    errors: [{ message: "Something went wrong" }],
  });
});

export default app;
