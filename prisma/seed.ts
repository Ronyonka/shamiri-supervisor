import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SessionStatus = 'PROCESSED' | 'FLAGGED' | 'SAFE';

const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadTranscript(filename: string): string {
  const filePath = path.join(__dirname, 'transcripts', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing transcript file: ${filename}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Spread 12 sessions deterministically across the last 60 days.
 * Divides 60 days into 12 equal slots of 5 days each,
 * placing one session at the midpoint of each slot.
 */
function getSessionDate(index: number): Date {
  const now = new Date();
  // Zero out time for determinism
  now.setHours(10, 0, 0, 0);

  const totalDays = 60;
  const totalSessions = 12;
  const slotSize = totalDays / totalSessions; // 5 days per slot

  // Session 0 gets the earliest date, session 11 gets the most recent
  const daysAgo = totalDays - (index * slotSize + slotSize / 2);
  const date = new Date(now);
  date.setDate(date.getDate() - Math.round(daysAgo));
  return date;
}

// ── Session definitions ─────────────────────────────────────────────────────

interface SessionDef {
  filename: string;
  status: SessionStatus;
  fellowIndex: number; // 0 = Zawadi, 1 = Kofi, 2 = Amina
}

const sessionDefs: SessionDef[] = [
  // Zawadi Mwangi — Group A (slots 0–3)
  { filename: 'zawadi_session_1.txt', status: 'SAFE', fellowIndex: 0 },
  { filename: 'zawadi_session_2.txt', status: 'PROCESSED', fellowIndex: 0 },
  { filename: 'zawadi_session_3.txt', status: 'FLAGGED', fellowIndex: 0 },
  { filename: 'zawadi_session_4.txt', status: 'SAFE', fellowIndex: 0 },

  // Kofi Asante — Group B (slots 4–7)
  { filename: 'kofi_session_1.txt', status: 'SAFE', fellowIndex: 1 },
  { filename: 'kofi_session_2.txt', status: 'PROCESSED', fellowIndex: 1 },
  { filename: 'kofi_session_3.txt', status: 'FLAGGED', fellowIndex: 1 },
  { filename: 'kofi_session_4.txt', status: 'PROCESSED', fellowIndex: 1 },

  // Amina Diallo — Group C (slots 8–11)
  { filename: 'amina_session_1.txt', status: 'SAFE', fellowIndex: 2 },
  { filename: 'amina_session_2.txt', status: 'FLAGGED', fellowIndex: 2 },
  { filename: 'amina_session_3.txt', status: 'PROCESSED', fellowIndex: 2 },
  { filename: 'amina_session_4.txt', status: 'SAFE', fellowIndex: 2 },
];

// ── Main seed ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // 1. Supervisor
  const passwordHash = await bcrypt.hash('shamiri123', 10);

  const supervisor = await prisma.supervisor.upsert({
    where: { email: 'amara@shamiri.co' },
    update: { name: 'Dr. Amara Osei', passwordHash },
    create: {
      email: 'amara@shamiri.co',
      name: 'Dr. Amara Osei',
      passwordHash,
    },
  });

  // 2. Fellows
  const fellowData = [
    { name: 'Zawadi Mwangi', email: 'zawadi@shamiri.co' },
    { name: 'Kofi Asante', email: 'kofi@shamiri.co' },
    { name: 'Amina Diallo', email: 'amina@shamiri.co' },
  ] as const;

  const fellows = await Promise.all(
    fellowData.map((f) =>
      prisma.fellow.upsert({
        where: { email: f.email },
        update: { name: f.name, supervisorId: supervisor.id },
        create: {
          email: f.email,
          name: f.name,
          supervisorId: supervisor.id,
        },
      }),
    ),
  );

  // 3. Groups (one per fellow)
  const groupNames = ['Group A', 'Group B', 'Group C'] as const;

  const groups = await Promise.all(
    groupNames.map((name, i) =>
      prisma.group.upsert({
        where: {
          // Deterministic stable ID for idempotent upserts
          id: `seed-group-${fellows[i].id}-${name}`,
        },
        update: { name, fellowId: fellows[i].id },
        create: {
          id: `seed-group-${fellows[i].id}-${name}`,
          name,
          fellowId: fellows[i].id,
        },
      }),
    ),
  );

  // 4. Sessions + 5. Transcripts
  for (let i = 0; i < sessionDefs.length; i++) {
    const def = sessionDefs[i];
    const fellow = fellows[def.fellowIndex];
    const group = groups[def.fellowIndex];
    const date = getSessionDate(i);

    // Deterministic session ID for idempotent upserts
    const sessionId = `seed-session-${fellow.id}-${date.toISOString().slice(0, 10)}`;

    const session = await prisma.session.upsert({
      where: { id: sessionId },
      update: {
        status: def.status,
        date,
        fellowId: fellow.id,
        groupId: group.id,
        supervisorId: supervisor.id,
      },
      create: {
        id: sessionId,
        fellowId: fellow.id,
        groupId: group.id,
        supervisorId: supervisor.id,
        date,
        status: def.status,
      },
    });

    // Load transcript from file
    const rawText = loadTranscript(def.filename);

    await prisma.transcript.upsert({
      where: { sessionId: session.id },
      update: { rawText },
      create: {
        sessionId: session.id,
        rawText,
      },
    });
  }

  console.log(
    '✅ Seeded: 1 supervisor | 3 fellows | 3 groups | 12 sessions | 12 transcripts',
  );
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
