// lib/prisma.ts - With fallback for build
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Dummy function to prevent build errors when DB is not available
export const getPrismaClient = () => {
  try {
    return prisma;
  } catch (error) {
    console.warn('Prisma client not available');
    return null;
  }
};
