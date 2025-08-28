const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking for users with null passwords...');
    
    const usersWithNullPasswords = await prisma.user.findMany({
      where: {
        password: null
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        provider: true,
        googleId: true
      }
    });

    console.log(`Found ${usersWithNullPasswords.length} users with null passwords:`);
    console.log(JSON.stringify(usersWithNullPasswords, null, 2));

    const totalUsers = await prisma.user.count();
    console.log(`Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();