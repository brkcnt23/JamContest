import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = 'asd123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Test user (USER role)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@jamcontest.com' },
    update: { passwordHash },
    create: {
      email: 'test@jamcontest.com',
      username: 'testuser',
      displayName: 'Test User',
      passwordHash,
      language: 'en',
      emailVerified: true,
      globalRole: 'USER',
    },
  });

  // Admin user (ADMIN role)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jamcontest.com' },
    update: { passwordHash },
    create: {
      email: 'admin@jamcontest.com',
      username: 'admin',
      displayName: 'Admin User',
      passwordHash,
      language: 'en',
      emailVerified: true,
      globalRole: 'ADMIN',
    },
  });

  // Super Admin user (SUPER_ADMIN role)
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@jamcontest.com' },
    update: { passwordHash },
    create: {
      email: 'superadmin@jamcontest.com',
      username: 'superadmin',
      displayName: 'Super Admin',
      passwordHash,
      language: 'en',
      emailVerified: true,
      globalRole: 'SUPER_ADMIN',
    },
  });

  // Organizer user (USER role - will apply for organizer)
  const organizerUser = await prisma.user.upsert({
    where: { email: 'organizer@jamcontest.com' },
    update: { passwordHash },
    create: {
      email: 'organizer@jamcontest.com',
      username: 'organizer',
      displayName: 'Organizer User',
      passwordHash,
      language: 'en',
      emailVerified: true,
      globalRole: 'USER',
    },
  });

  // Jury user (USER role - will apply for jury)
  const juryUser = await prisma.user.upsert({
    where: { email: 'jury@jamcontest.com' },
    update: { passwordHash },
    create: {
      email: 'jury@jamcontest.com',
      username: 'jury',
      displayName: 'Jury User',
      passwordHash,
      language: 'en',
      emailVerified: true,
      globalRole: 'USER',
    },
  });

  console.log('✅ Users created:');
  console.log(`  - ${testUser.email} (USER)`);
  console.log(`  - ${adminUser.email} (ADMIN)`);
  console.log(`  - ${superAdminUser.email} (SUPER_ADMIN)`);
  console.log(`  - ${organizerUser.email} (USER - organizer candidate)`);
  console.log(`  - ${juryUser.email} (USER - jury candidate)`);
  console.log(`All passwords: ${password}`);
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });