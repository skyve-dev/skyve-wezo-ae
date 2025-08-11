import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  try {
    const adminEmail = 'admin@wezo.ae';
    const adminUsername = 'admin';
    const adminPassword = 'Admin@123456';

    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [{ email: adminEmail }, { username: adminUsername }],
      },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log('✅ Admin user created successfully:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Password:', adminPassword);
    console.log('   ⚠️  Please change the admin password after first login!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });