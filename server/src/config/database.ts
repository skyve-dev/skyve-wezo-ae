import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'], // Only log warnings and errors, no SQL queries
});

export default prisma;