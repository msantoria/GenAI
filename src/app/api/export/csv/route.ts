import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const sessions = await prisma.session.findMany({
    include: { athlete: true, analysis: true }
  });

  const rows = [
    ['Athlete', 'Sport', 'Drill', 'Date', 'PowerScore', 'Provider'].join(',')
  ];

  sessions.forEach((session) => {
    const power = (session.analysis?.reportCard as Record<string, number> | undefined)?.power ?? '';
    rows.push(
      [
        session.athlete.name,
        session.athlete.sportFocus,
        session.drillType,
        session.createdAt.toISOString(),
        power,
        session.analysis?.provider ?? 'pending'
      ].join(',')
    );
  });

  const csv = rows.join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="genai-report.csv"'
    }
  });
}
