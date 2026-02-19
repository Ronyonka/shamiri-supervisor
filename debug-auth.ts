import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("----------------------------------------");
  console.log("🔐 Shamiri Auth Debugger");
  console.log("----------------------------------------");
  console.log("Checking database connection...");
  
  try {
    // 1. Check Connection
    const supervisorCount = await prisma.supervisor.count();
    console.log(`✅ Database Connected. Found ${supervisorCount} supervisors.`);
  } catch (e: any) {
    console.error("❌ CONNECTION FAILED");
    console.error("   Error:", e.message);
    console.log("----------------------------------------");
    console.log("TIP: Check your DATABASE_URL in .env");
    console.log("It should start with 'postgres://' or 'postgresql://'");
    return;
  }

  // 2. Check User
  const email = 'amara@shamiri.co';
  console.log(`\n🔍 Searching for user: ${email}...`);
  const user = await prisma.supervisor.findUnique({ 
    where: { email } 
  });

  if (!user) {
    console.error(`❌ USER NOT FOUND: ${email}`);
    console.log("   The database is accessible, but this user is missing.");
    console.log("   FIX: Run 'npx prisma db seed' to create the user.");
    return;
  }
  console.log("✅ User found:", user.id, user.name);

  // 3. Check Password
  const testPassword = 'shamiri123';
  console.log(`\n🔑 Verifying password: '${testPassword}'...`);
  const isValid = await compare(testPassword, user.passwordHash);

  if (isValid) {
    console.log("✅ PASSWORD MATCH! The credentials are correct in the DB.");
    console.log("----------------------------------------");
    console.log("👉 If this works but Vercel fails, the issue is Vercel-specific:");
    console.log("   - NEXTAUTH_SECRET mismatch?");
    console.log("   - Vercel IP blocked by DB?");
    console.log("   - Check Vercel Function Logs for timeout errors.");
  } else {
    console.error("❌ PASSWORD MISMATCH");
    console.log("   The user exists, but the password hash in the DB does not match 'shamiri123'.");
    console.log("   FIX: Run 'npx prisma db seed' again or update the user.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
