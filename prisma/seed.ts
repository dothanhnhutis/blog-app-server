import { hashPassword } from "../src/utils";
import prisma from "../src/utils/db";

async function seed() {
  await prisma.user.deleteMany();
  const hash = hashPassword("@Abc123123");
  const user = await prisma.user.create({
    data: {
      email: "gaconght001@gmail.com",
      password: hash,
      username: "Admin",
      role: "Admin",
    },
  });

  const expectDeliveryAt = new Date(Date.now() + 24 * 60 * 60 * 5);
  await prisma.order.create({
    data: {
      name: "hoa chat",
      type: "CHEMICALS",
      status: "CREATE",
      unit: "GRAMS",
      amount: 1000,
      expectDeliveryAt,
      log: {
        create: {
          data: {
            name: "hoa chat",
            type: "CHEMICALS",
            status: "CREATE",
            unit: "GRAMS",
            amount: 1000,
            expectDeliveryAt,
          },
          userId: user.id,
        },
      },
    },
  });
}

seed();
