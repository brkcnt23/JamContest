import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_EMAILS = [
  'superadmin@jamcontest.com',
  'admin@jamcontest.com',
  'organizer1@jamcontest.com',
  'organizer2@jamcontest.com',
  'jury1@jamcontest.com',
  'jury2@jamcontest.com',
  'jury3@jamcontest.com',
  'p1@jamcontest.com',
  'p2@jamcontest.com',
  'p3@jamcontest.com',
  'p4@jamcontest.com',
  'p5@jamcontest.com',
  'p6@jamcontest.com',
  'p7@jamcontest.com',
  'p8@jamcontest.com',
  'test@jamcontest.com',
];

async function main() {
  const hash = await bcrypt.hash('asd123', 10);

  for (const email of SEED_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`SKIP (not found): ${email}`);
      continue;
    }
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, emailVerified: true },
    });
    console.log(`OK: ${email} (${user.username})`);
  }

  console.log('\nDone — all passwords reset to asd123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
