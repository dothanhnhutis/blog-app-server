import { Router, Request } from "express";
import { requiredAuth } from "../middleware/requiredAuth";
import { roleAccess } from "../middleware/checkRole";
import { validateResource } from "../middleware/validateResource";
import prisma from "../utils/db";
import {
  EditUserInput,
  editUserValidation,
} from "../validations/user.validations";
import { BadRequestError } from "../errors/bad-request-error";

const router = Router();

// router.patch(
//   "/:id",
//   requiredAuth,
//   roleAccess(["ADMIN"]),
//   validateResource(editUserValidation),
//   async (
//     req: Request<EditUserInput["params"], {}, EditUserInput["body"]>,
//     res
//   ) => {
//     const userReq = await prisma.user.findUnique({
//       where: { id: res.locals.currentUser!.id },
//     });
//     if (!userReq) throw new BadRequestError("User is Block");

//     const { id } = req.params;

//     const users = await prisma.user.findMany({
//       where: { email: { not: user.email } },
//       include: {
//         userPreference: true,
//       },
//     });
//     res.send(users);
//   }
// );

// router.get("/", requiredAuth, roleAccess(["ADMIN"]), async (req, res) => {
//   const user = res.locals.currentUser!;
//   const users = await prisma.user.findMany({
//     where: { email: { not: user.email } },
//     include: {
//       userPreference: true,
//     },
//     orderBy: {
//       status: "asc",
//     },
//   });
//   res.send(users);
// });

export default router;
