import { z } from "zod";

export const permissionEnum = [
  "USER_VIEW",
  "USER_CREATE",
  "USER_EDIT",
  "USER_DELETE",
  "ROLE_VIEW",
  "ROLE_CREATE",
  "ROLE_EDIT",
  "ROLE_DELETE",
  "TAG_VIEW",
  "TAG_CREATE",
  "TAG_EDIT",
  "TAG_DELETE",
  "POST_VIEW",
  "POST_CREATE",
  "POST_EDIT",
  "POST_DELETE",
] as const;

const roleParams = z
  .object({
    id: z.string(),
  })
  .strict();

const permissionZod = z.enum(permissionEnum);

const roleBody = z.object({
  roleName: z.string({
    required_error: "roleName field is required",
    invalid_type_error: "roleName field must be string",
  }),
  permissions: permissionZod.array(),
});

export const getRoleValidation = z.object({
  params: roleParams,
});
export const deleteRoleValidation = getRoleValidation;

export const editRoleValidation = z.object({
  params: roleParams,
  body: roleBody.partial(),
});

export const createRoleValidation = z.object({
  body: roleBody.strict(),
});

export type Permission = z.infer<typeof permissionZod>;
export type GetRoleInput = z.infer<typeof getRoleValidation>;
export type CreateRoleInput = z.infer<typeof createRoleValidation>;
export type EditRoleInput = z.infer<typeof editRoleValidation>;
export type DeleteRoleInput = GetRoleInput;
