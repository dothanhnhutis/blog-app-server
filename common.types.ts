import { Permissions } from "./src/validations/role.validations";

export type UserAuth = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isActive: boolean;
  role: {
    id: string;
    roleName: string;
    canDelete: boolean;
    permissions: Permissions;
  };
};
