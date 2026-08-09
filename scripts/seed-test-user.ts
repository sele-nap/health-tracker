import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { hashPassword } from '@better-auth/utils/password';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EMAIL = 'test@health.local';
const PASSWORD = 'password123';
const NAME = 'Selena Test';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function vary(base: number, range: number) {
  return clamp(
    base + Math.floor(Math.random() * (range * 2 + 1)) - range,
    1,
    10,
  );
}

async function main() {
  console.log('✨ Seeding test user…');

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`⚠️  User ${EMAIL} already exists (id: ${existing.id}).`);
    console.log('   Delete with: npm run seed:reset');
    return;
  }

  const userId = randomUUID();
  const accountId = randomUUID();
  const hashed = await hashPassword(PASSWORD);

  await prisma.user.create({
    data: {
      id: userId,
      email: EMAIL,
      name: NAME,
      emailVerified: true,
      accounts: {
        create: {
          id: accountId,
          accountId: userId,
          providerId: 'credential',
          password: hashed,
        },
      },
    },
  });

  console.log('✅ User created');

  // --- Conditions ---
  const lupus = await prisma.userCondition.create({
    data: {
      userId,
      name: 'Lupus',
      diagnosedAt: new Date('2014-03-15'),
    },
  });

  await prisma.userCondition.create({
    data: {
      userId,
      name: 'Syndrome de Raynaud',
      diagnosedAt: new Date('2016-11-01'),
    },
  });

  // --- Custom symptom definitions ---
  const jointPainDef = await prisma.symptomDefinition.create({
    data: {
      conditionId: lupus.id,
      name: 'Douleurs articulaires',
      unit: '/10',
    },
  });

  const fatigueDef = await prisma.symptomDefinition.create({
    data: {
      conditionId: lupus.id,
      name: 'Fatigue lupique',
      unit: '/10',
    },
  });

  // --- Medications ---
  const hcq = await prisma.medication.create({
    data: {
      userId,
      name: 'Hydroxychloroquine',
      dosage: '200 mg',
      form: 'tablet',
      startDate: new Date('2021-04-01'),
      isActive: true,
    },
  });

  const prednisone = await prisma.medication.create({
    data: {
      userId,
      name: 'Prednisone',
      dosage: '5 mg',
      form: 'tablet',
      startDate: new Date('2024-01-15'),
      isActive: true,
    },
  });

  await prisma.medication.create({
    data: {
      userId,
      name: 'Ibuprofène',
      dosage: '400 mg',
      form: 'tablet',
      startDate: new Date('2022-06-01'),
      endDate: new Date('2024-08-01'),
      isActive: false,
    },
  });

  // --- 30 days of symptom logs ---
  const DAYS = 30;

  const baseMood = [
    6, 5, 7, 4, 6, 8, 7, 5, 6, 7, 4, 5, 8, 7, 6, 5, 3, 4, 6, 7, 8, 7, 6, 5, 7,
    8, 6, 5, 7, 6,
  ];
  const baseEnergy = [
    5, 4, 6, 3, 5, 7, 6, 4, 5, 6, 3, 4, 7, 6, 5, 4, 2, 3, 5, 6, 7, 6, 5, 4, 6,
    7, 5, 4, 6, 5,
  ];
  const baseStress = [
    6, 7, 4, 8, 5, 3, 4, 7, 6, 4, 8, 7, 3, 4, 5, 7, 9, 8, 6, 5, 3, 4, 5, 7, 4,
    3, 5, 6, 4, 5,
  ];
  const baseSleepH = [
    6.5, 7, 5.5, 8, 6, 7.5, 7, 5, 6.5, 7.5, 5, 6, 8, 7, 6.5, 5.5, 4.5, 5, 6.5,
    7, 8, 7.5, 6, 5.5, 7, 8, 6.5, 6, 7.5, 7,
  ];
  const baseSleepQ = [
    6, 7, 5, 7, 6, 8, 7, 4, 6, 7, 4, 5, 8, 7, 6, 5, 3, 4, 6, 7, 8, 7, 6, 5, 7,
    8, 6, 5, 7, 6,
  ];

  for (let i = 0; i < DAYS; i++) {
    const loggedAt = daysAgo(DAYS - 1 - i);

    const log = await prisma.symptomLog.create({
      data: {
        userId,
        loggedAt,
        overallMood: vary(baseMood[i], 1),
        energyLevel: vary(baseEnergy[i], 1),
        stressLevel: vary(baseStress[i], 1),
        sleepHours: baseSleepH[i],
        sleepQuality: vary(baseSleepQ[i], 1),
        notes:
          i === 16
            ? 'Poussée lupique, grosse fatigue et douleurs.'
            : i === 20
              ? 'Meilleure journée depuis longtemps !'
              : undefined,
      },
    });

    await prisma.symptomLogEntry.createMany({
      data: [
        {
          symptomLogId: log.id,
          symptomDefinitionId: jointPainDef.id,
          value: String(vary(i === 16 ? 9 : i === 17 ? 8 : 5, 2)),
        },
        {
          symptomLogId: log.id,
          symptomDefinitionId: fatigueDef.id,
          value: String(vary(i === 16 ? 9 : i === 17 ? 8 : 5, 2)),
        },
      ],
    });
  }

  // --- 30 days of medication logs ---
  for (let i = 0; i < DAYS; i++) {
    const scheduled = daysAgo(DAYS - 1 - i);
    scheduled.setHours(9, 0, 0, 0);

    const hcqTaken = i !== 10 && i !== 16;
    await prisma.medicationLog.create({
      data: {
        medicationId: hcq.id,
        scheduledFor: scheduled,
        takenAt: hcqTaken
          ? new Date(scheduled.getTime() + 15 * 60 * 1000)
          : null,
        status: hcqTaken ? 'TAKEN' : 'SKIPPED',
      },
    });

    const predTaken = i !== 16;
    await prisma.medicationLog.create({
      data: {
        medicationId: prednisone.id,
        scheduledFor: scheduled,
        takenAt: predTaken
          ? new Date(scheduled.getTime() + 20 * 60 * 1000)
          : null,
        status: predTaken ? 'TAKEN' : 'SKIPPED',
      },
    });
  }

  // --- Appointments ---
  const today = new Date();

  await prisma.appointment.create({
    data: {
      userId,
      title: 'Suivi rhumatologie',
      specialty: 'rheumatology',
      scheduledAt: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7,
        10,
        30,
      ),
      durationMin: 30,
      status: 'UPCOMING',
    },
  });

  await prisma.appointment.create({
    data: {
      userId,
      title: 'Bilan sanguin',
      specialty: 'laboratory',
      scheduledAt: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 3,
        8,
        0,
      ),
      durationMin: 15,
      status: 'UPCOMING',
    },
  });

  await prisma.appointment.create({
    data: {
      userId,
      title: 'Dermatologie - contrôle',
      specialty: 'dermatology',
      scheduledAt: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 14,
        14,
        0,
      ),
      durationMin: 20,
      status: 'COMPLETED',
      summary: 'RAS, pas de nouvelles lésions. Continuer photoprotection.',
    },
  });

  await prisma.appointment.create({
    data: {
      userId,
      title: 'Ophtalmologie annuel',
      specialty: 'ophthalmology',
      scheduledAt: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 45,
        9,
        0,
      ),
      durationMin: 45,
      status: 'COMPLETED',
      summary: "Fond d'oeil normal, pas de toxicité rétinienne HCQ.",
    },
  });

  console.log('✅ Sample data seeded:');
  console.log('   • 2 conditions (Lupus, Raynaud)');
  console.log('   • 2 custom symptom definitions');
  console.log('   • 3 medications (2 active, 1 inactive) + 30 days of logs');
  console.log('   • 30 symptom logs with custom entries');
  console.log('   • 4 appointments (2 upcoming, 2 completed)');
  console.log('');
  console.log(`🔑  Email    ${EMAIL}`);
  console.log(`🔑  Password ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message ?? e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
