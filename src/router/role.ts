import { Request, Router } from "express";
import { requiredAuth } from "../middleware/requiredAuth";
import { roleAccess } from "../middleware/checkRole";
import { validateResource } from "../middleware/validateResource";
import {
  CreateRoleInput,
  DeleteRoleInput,
  EditRoleInput,
  GetRoleInput,
  createRoleValidation,
  deleteRoleValidation,
  editRoleValidation,
  getRoleValidation,
} from "../validations/role.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";

const route = Router();

route.get(
  "/:id",
  requiredAuth,
  roleAccess("ROLE_VIEW"),
  validateResource(getRoleValidation),
  async (req: Request<GetRoleInput["params"]>, res) => {
    const { id } = req.params;
    const role = await prisma.role.findUnique({ where: { id } });
    return res.send(role);
  }
);

route.patch(
  "/:id",
  requiredAuth,
  roleAccess("ROLE_EDIT"),
  validateResource(editRoleValidation),
  async (
    req: Request<EditRoleInput["params"], {}, EditRoleInput["body"]>,
    res
  ) => {
    const { permissions, roleName } = req.body;
    const { id } = req.params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new BadRequestError("role not exist");
    if (role.isLock) throw new BadRequestError("role can not edit");

    const newRole = await prisma.role.update({
      where: {
        id,
      },
      data: {
        roleName,
        permissions,
      },
    });
    return res.send(newRole);
  }
);

route.delete(
  "/:id",
  requiredAuth,
  roleAccess("ROLE_DELETE"),
  validateResource(deleteRoleValidation),
  async (req: Request<DeleteRoleInput["params"]>, res) => {
    const { id } = req.params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new BadRequestError("role not exist");
    if (role.isLock) throw new BadRequestError("role can not delete");
    const roleDeleted = await prisma.role.delete({
      where: {
        id,
      },
    });
    return res.send(roleDeleted);
  }
);

route.post(
  "/",
  requiredAuth,
  roleAccess("ROLE_CREATE"),
  validateResource(createRoleValidation),
  async (req: Request<{}, {}, CreateRoleInput["body"]>, res) => {
    const { permissions, roleName } = req.body;
    const role = await prisma.role.create({
      data: {
        roleName,
        permissions,
      },
    });
    return res.send(role);
  }
);

route.get("/", requiredAuth, roleAccess("ROLE_VIEW"), async (req, res) => {
  const roles = await prisma.role.findMany();
  return res.send(roles);
});

export default route;
