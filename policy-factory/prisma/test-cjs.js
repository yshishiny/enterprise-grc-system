require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection (CJS)...');
  try {
    const userCount = await prisma.user.count();
    console.log(`Connection successful. Current user count: ${userCount}`);
  } catch (err) {
    console.error('Prisma connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
