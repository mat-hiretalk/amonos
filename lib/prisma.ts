import { PrismaClient, Prisma } from "@prisma/client";

//Singleton nsures only one instance of PrismaClient is created
declare global {
  var prisma: PrismaClient | undefined;
}

//manage db efficiently by reusing global instance or creating a new one
//avoids memory overhead or db pool exhaustion
const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
