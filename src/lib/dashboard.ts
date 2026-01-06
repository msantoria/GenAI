import { prisma } from './db';

export async function getDashboardOverview() {
  const programs = await prisma.program.findMany({ include: { athletes: true } });
  const athletes = await prisma.athlete.findMany({ include: { sessions: { include: { analysis: true } } } });
  const sessions = await prisma.session.findMany({ include: { analysis: true } });

  const latestAnalyses = sessions.filter((s) => s.analysis).length;

  return {
    programCount: programs.length,
    athleteCount: athletes.length,
    sessionCount: sessions.length,
    analyzedSessions: latestAnalyses,
    athletes: athletes.slice(0, 6)
  };
}

export async function getCoachStats() {
  const programs = await prisma.program.findMany({ include: { athletes: { include: { sessions: { include: { analysis: true } } } } } });
  const sessions = await prisma.session.findMany({ include: { analysis: true } });

  const participation = programs.map((program) => ({
    name: program.name,
    athletes: program.athletes.length,
    sessions: program.athletes.reduce((acc, athlete) => acc + athlete.sessions.length, 0)
  }));

  const improvementBuckets: Record<string, number> = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
  sessions.forEach((session) => {
    const score = (session.analysis?.reportCard as Record<string, number> | null)?.power ?? 0;
    if (score <= 25) improvementBuckets['0-25']++;
    else if (score <= 50) improvementBuckets['26-50']++;
    else if (score <= 75) improvementBuckets['51-75']++;
    else improvementBuckets['76-100']++;
  });

  return { participation, improvementBuckets, sessionCount: sessions.length };
}
