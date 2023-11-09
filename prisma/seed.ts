import { RoleType } from "../common.types";
import { hashPassword } from "../src/utils";
import prisma from "../src/utils/db";

const roles: RoleType[] = [
  {
    canDelete: false,
    roleName: "Subscriber",
    permissions: [],
  },
];

async function seed() {
  await Promise.all(
    roles.map(
      async (role) =>
        await prisma.role.create({
          data: role,
        })
    )
  );

  const hash = hashPassword("@Abc123123");
  await prisma.user.create({
    data: {
      email: "gaconght001@gmail.com",
      password: hash,
      username: "Admin",
      role: {
        create: {
          canDelete: false,
          roleName: "Admin",
          permissions: [
            "USER_VIEW",
            "USER_EDIT",
            "USER_DELETE",
            "ROLE_VIEW",
            "ROLE_EDIT",
            "ROLE_DELETE",
            "TAG_VIEW",
            "TAG_EDIT",
            "TAG_DELETE",
            "POST_VIEW",
            "POST_EDIT",
            "POST_DELETE",
          ],
        },
      },
    },
  });
}

seed();
