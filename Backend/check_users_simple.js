const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking all users without password selection...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        provider: true,
        googleId: true
      }
    });

    console.log(`Found ${allUsers.length} users:`);
    console.log(JSON.stringify(allUsers, null, 2));

    // Now try with password selection
    console.log('\nTrying to select password field...');
    const usersWithPassword = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true
      }
    });
    
    console.log(`Successfully retrieved ${usersWithPassword.length} users with password field`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();