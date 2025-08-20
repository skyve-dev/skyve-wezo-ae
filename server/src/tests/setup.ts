import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { beforeAll, afterAll } from '@jest/globals';

const prisma = new PrismaClient();

export async function cleanupDatabase() {
  try {
    // Use raw SQL to truncate tables and reset sequences
    // This bypasses foreign key checks during the operation
    const tableNames = [
      'PricePerGroupSize',
      'Promotion', 
      'Pricing',
      'Cancellation',
      'CheckInOutTimes',
      'Bed',
      'Room',
      'Amenity',
      'Photo',
      'Property',
      'LatLong', 
      'Address',
      'User',
      'PropertyGroup'
    ];
    
    // Disable foreign key checks temporarily and truncate tables
    await prisma.$executeRaw`SET session_replication_role = replica;`;
    
    for (const tableName of tableNames) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
  } catch (error) {
    console.error('Database cleanup error:', error);
    // If the above fails, try the manual approach with error handling
    try {
      await prisma.pricePerGroupSize.deleteMany();
      await prisma.promotion.deleteMany();
      await prisma.pricing.deleteMany();
      await prisma.cancellation.deleteMany();
      await prisma.checkInOutTimes.deleteMany();
      await prisma.bed.deleteMany();
      await prisma.room.deleteMany();
      await prisma.amenity.deleteMany();
      await prisma.photo.deleteMany();
      await prisma.property.deleteMany();
      await prisma.latLong.deleteMany();
      await prisma.address.deleteMany();
      await prisma.user.deleteMany();
      await prisma.propertyGroup.deleteMany();
    } catch (secondError) {
      console.error('Fallback cleanup also failed:', secondError);
    }
  }
}

beforeAll(async () => {
  process.env.DATABASE_URL = 'postgresql://postgres:123456@localhost:5432/wezo_db';
  
  // Use migrate deploy in CI/test environment
  try {
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://postgres:123456@localhost:5432/wezo_db',
      },
    });
  } catch (error) {
    // If no migrations exist, push the schema directly
    execSync('npx prisma db push --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://postgres:123456@localhost:5432/wezo_db',
      },
    });
  }
});

// beforeEach cleanup disabled - let individual tests handle cleanup

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});