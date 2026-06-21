const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.upsert({
    where:  { id: '6b874e63-7368-4d9a-ba2a-b0252eb3044e' },
    update: { role: 'SUPER_ADMIN', isActive: true },
    create: {
      id:       '6b874e63-7368-4d9a-ba2a-b0252eb3044e',
      email:    'daimzakriya@gmail.com',
      name:     'DBZ',
      role:     'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('Done:', JSON.stringify(profile, null, 2));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
