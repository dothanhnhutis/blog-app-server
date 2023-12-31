import { RequestHandler as Middleware } from "express";
import { verifyJWT } from "../utils/jwt";
import prisma from "../utils/db";
import { UserAuth } from "../../common.types";

export const deserializeUser: Middleware = async (req, res, next) => {
  const accessToken = (
    req.header("x-token") ||
    req.headers.authorization ||
    req.header("Authorization") ||
    ""
  ).replace(/^Bearer\s/, "");
  if (!accessToken) return next();
  const decoded = verifyJWT<UserAuth>(
    accessToken,
    process.env.JWT_SECRET ?? ""
  );
  if (decoded) {
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, isActive: true },
    });
    if (user) {
      res.locals.currentUser = {
        avatarUrl: user.avatarUrl,
        email: user.email,
        id: user.id,
        isActive: user.isActive,
        role: user.role,
        username: user.username,
      };
    }
  }

  return next();
};
