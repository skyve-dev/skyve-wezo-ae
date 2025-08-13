import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { beforeAll, afterAll } from '@jest/globals';

const prisma = new PrismaClient();

beforeAll(async () => {
  process.env.DATABASE_URL = 'postgresql://postgres:123456@localhost:5432/wezo_db';
  execSync('npx prisma migrate dev --name test-migration', {
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:123456@localhost:5432/wezo_db',
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});