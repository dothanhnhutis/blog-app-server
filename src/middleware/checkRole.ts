import { RequestHandler as Middleware, Request } from "express";
import { PermissionError } from "../errors/permission-error";
import { Role } from "../validations/user.validations";

export const roleAccess =
  (role: Role[]): Middleware =>
  (req, res, next) => {
    if (res.locals.currentUser && role.includes(res.locals.currentUser.role)) {
      next();
    } else {
      throw new PermissionError();
    }
  };
