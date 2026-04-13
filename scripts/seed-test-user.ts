import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "@better-auth/utils/password";
import { randomUUID } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);
const db = prisma as any;

const EMAIL = "test@health.local";
const PASSWORD = "password123";
const NAME = "Selena Test";

async function main() {
  console.log("🌿 Seeding test user…");

  const existing = await db.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`⚠️  User ${EMAIL} already exists (id: ${existing.id}).`);
    console.log("   Delete with: npm run seed:reset");
    return;
  }

  const userId = randomUUID();
  const accountId = randomUUID();
  const hashed = await hashPassword(PASSWORD);

  await db.user.create({
    data: {
      id: userId,
      email: EMAIL,
      name: NAME,
      emailVerified: true,
      accounts: {
        create: {
          id: accountId,
          accountId: userId,
          providerId: "credential",
          password: hashed,
        },
      },
    },
  });

  console.log("✅ User created");

  await db.userCondition.create({
    data: {
      userId,
      name: "Lupus",
      diagnosedAt: new Date("2014-03-15"),
    },
  });

  const medication = await db.medication.create({
    data: {
      userId,
      name: "Hydroxychloroquine",
      dosage: "200 mg",
      form: "tablet",
      startDate: new Date("2021-04-01"),
      isActive: true,
    },
  });

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const statuses = ["TAKEN", "TAKEN", "TAKEN", "SKIPPED", "TAKEN", "TAKEN", "TAKEN"] as const;

  for (let i = 0; i < 7; i++) {
    const scheduled = new Date(sevenDaysAgo);
    scheduled.setDate(sevenDaysAgo.getDate() + i);
    scheduled.setHours(9, 0, 0, 0);
    const status = statuses[i];

    await db.medicationLog.create({
      data: {
        medicationId: medication.id,
        scheduledFor: scheduled,
        takenAt: status === "TAKEN" ? new Date(scheduled.getTime() + 15 * 60 * 1000) : null,
        status,
      },
    });
  }

  const overallMoods =    [6, 5, 7, 4, 6, 8, 7];
  const energyLevels =    [5, 4, 6, 3, 5, 7, 6];
  const stressLevels =    [6, 7, 4, 8, 5, 3, 4];
  const sleepHours =      [6.5, 7, 5.5, 8, 6, 7.5, 7];
  const sleepQualities =  [6, 7, 5, 7, 6, 8, 7];

  for (let i = 0; i < 7; i++) {
    const loggedAt = new Date(sevenDaysAgo);
    loggedAt.setDate(sevenDaysAgo.getDate() + i);
    loggedAt.setHours(8, 0, 0, 0);

    await db.symptomLog.create({
      data: {
        userId,
        loggedAt,
        overallMood: overallMoods[i],
        energyLevel: energyLevels[i],
        stressLevel: stressLevels[i],
        sleepHours: sleepHours[i],
        sleepQuality: sleepQualities[i],
      },
    });
  }

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  nextWeek.setHours(10, 30, 0, 0);

  await db.appointment.create({
    data: {
      userId,
      title: "Rheumatology follow-up",
      specialty: "rheumatology",
      scheduledAt: nextWeek,
      durationMin: 30,
      status: "UPCOMING",
    },
  });

  console.log("✅ Sample data seeded:");
  console.log("   • 1 condition (Lupus)");
  console.log("   • 1 medication (Hydroxychloroquine) + 7 days of logs");
  console.log("   • 7 symptom logs");
  console.log("   • 1 upcoming appointment");
  console.log("");
  console.log(`🔑  Email    ${EMAIL}`);
  console.log(`🔑  Password ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
