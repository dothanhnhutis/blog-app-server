import { hashPassword } from "../src/utils";
import prisma from "../src/utils/db";
import { permissionEnum } from "../src/validations/role.validations";

async function seed() {
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.role.create({
    data: {
      isLock: true,
      roleName: "Subscriber",
      permissions: [],
    },
  });

  const hash = hashPassword("@Abc123123");
  await prisma.user.create({
    data: {
      email: "gaconght001@gmail.com",
      password: hash,
      username: "Admin",
      role: {
        create: {
          isLock: true,
          roleName: "Admin",
          permissions: [...permissionEnum],
        },
      },
    },
  });
}

seed();
