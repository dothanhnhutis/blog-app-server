import { Router, Request } from "express";
import { requiredAuth } from "../middleware/requiredAuth";
import { roleAccess } from "../middleware/checkRole";
import { validateResource } from "../middleware/validateResource";
import prisma from "../utils/db";
import {
  CreateUserInput,
  EditUserInput,
  GetUserInput,
  Role,
  createUserValidation,
  editUserValidation,
} from "../validations/user.validations";
import { BadRequestError } from "../errors/bad-request-error";
import { hashPassword } from "../utils";
import { PermissionError } from "../errors/permission-error";

const router = Router();
router.get("/me", requiredAuth, async (req, res) => {
  return res.send(res.locals.currentUser);
});

router.patch(
  "/:id",
  requiredAuth,
  validateResource(editUserValidation),
  async (
    req: Request<EditUserInput["params"], {}, EditUserInput["body"]>,
    res
  ) => {
    const { id } = req.params;
    const roleAccess: Role[] = ["Admin", "Manager"];
    if (
      id !== res.locals.currentUser?.id &&
      !roleAccess.includes(res.locals.currentUser?.role!)
    )
      throw new PermissionError();
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestError("use not exist");
    if (req.body.password) {
      req.body.password = hashPassword(req.body.password);
    }
    const userUpdate = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...req.body,
      },
    });
    const { password, ...userNoPass } = userUpdate;
    return res.send({ ...userNoPass });
  }
);

router.get(
  "/:id",
  requiredAuth,
  async (req: Request<GetUserInput["params"]>, res) => {
    const { id } = req.params;
    const roleAccess: Role[] = ["Admin", "Manager"];
    if (
      id !== res.locals.currentUser?.id &&
      !roleAccess.includes(res.locals.currentUser?.role!)
    )
      throw new PermissionError();
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (user) {
      const { password, ...userNoPass } = user;
      return res.send({ ...userNoPass });
    }
    return res.send(null);
  }
);

router.post(
  "/",
  requiredAuth,
  roleAccess(["Admin", "Manager"]),
  validateResource(createUserValidation),
  async (req: Request<{}, {}, CreateUserInput["body"]>, res) => {
    const { email, password, role, ...other } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) throw new BadRequestError("email has been used");

    const hashPass = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPass,
        role: role,
        ...other,
      },
    });
    const { password: _, ...resData } = newUser;
    return res.send(resData);
  }
);

router.get(
  "/",
  requiredAuth,
  roleAccess(["Admin", "Manager"]),
  async (req, res) => {
    const users = await prisma.user.findMany();
    return res.send(
      users.map((u) => {
        const { password, ...userNoPass } = u;
        return { ...userNoPass };
      })
    );
  }
);

export default router;
