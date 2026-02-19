import prisma from './src/lib/prisma';

async function main() {
  const session = await prisma.session.findFirst({
    include: { transcript: true }
  });
  if (session) {
    console.log(`SESSION_ID:${session.id}`);
    console.log(`HAS_TRANSCRIPT:${!!session.transcript}`);
  } else {
    console.log("NO_SESSION_FOUND");
  }
}

main().catch(console.error);
