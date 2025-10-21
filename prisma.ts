import { PrismaClient } from "@prisma/client";

declare global {
  // Using var declaration is required for global augmentation in Node's ESM
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;