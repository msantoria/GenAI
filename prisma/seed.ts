import { PrismaClient, DrillType, AgeBand } from '@prisma/client';
import { MockProvider } from '../src/lib/analysis/providers/MockProvider';

const prisma = new PrismaClient();
const mock = new MockProvider();

async function main() {
  await prisma.analysisResult.deleteMany();
  await prisma.session.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.athlete.deleteMany();
  await prisma.program.deleteMany();

  const program = await prisma.program.create({
    data: {
      name: 'Oswegoland Park District Pilot',
      description: 'Picture Day ready-to-demo program'
    }
  });

  const athletes = await prisma.athlete.createMany({
    data: [
      {
        name: 'Jordan Sparks',
        ageBand: AgeBand.AGE_11_13,
        sportFocus: 'basketball',
        parentEmail: 'parent1@example.com',
        consent: true,
        baselineDate: new Date(),
        programId: program.id
      },
      {
        name: 'Kai Ramirez',
        ageBand: AgeBand.AGE_14_18,
        sportFocus: 'soccer',
        parentEmail: 'parent2@example.com',
        consent: true,
        baselineDate: new Date(),
        programId: program.id
      },
      {
        name: 'Avery Lee',
        ageBand: AgeBand.AGE_8_10,
        sportFocus: 'general athleticism',
        consent: true,
        baselineDate: new Date(),
        programId: program.id
      }
    ]
  });

  const createdAthletes = await prisma.athlete.findMany({ where: { programId: program.id } });

  for (const athlete of createdAthletes) {
    await prisma.surveyResponse.create({
      data: {
        athleteId: athlete.id,
        avatarTheme: 'superhero',
        motivationStyle: 'rewards',
        goals: 'speed, agility',
        confidence: 4,
        injuries: 'none'
      }
    });

    const session = await prisma.session.create({
      data: {
        athleteId: athlete.id,
        drillType: DrillType.SPRINT,
        videoPath: '/sample_videos/sprint.mp4',
        usedSample: true
      }
    });

    const analysis = await mock.analyze({
      athleteId: athlete.id,
      sessionId: session.id,
      drillType: DrillType.SPRINT,
      survey: await prisma.surveyResponse.findUnique({ where: { athleteId: athlete.id } })
    });

    await prisma.analysisResult.create({
      data: {
        sessionId: session.id,
        provider: analysis.provider,
        metrics: analysis.metrics,
        cues: analysis.cues,
        reportCard: analysis.reportCard,
        practicePlan: analysis.practicePlan
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
