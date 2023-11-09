import { RequestHandler as Middleware, Request } from "express";
import { PermissionError } from "../errors/permission-error";
import { Permission } from "../validations/role.validations";

export const roleAccess =
  (role: Permission): Middleware =>
  (req, res, next) => {
    if (
      res.locals.currentUser &&
      res.locals.currentUser.role.permissions.includes(role)
    ) {
      next();
    } else {
      throw new PermissionError();
    }
  };
