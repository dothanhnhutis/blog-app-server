export type UserAuth = {
  id: string;
  email: string;
  roleId: string;
  isActive: boolean;
};

export type RoleType = {
  roleName: string;
  permissions: string[];
  canDelete: boolean;
};
