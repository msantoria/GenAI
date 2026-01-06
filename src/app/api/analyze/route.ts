import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzeSession, isMockMode } from '@/lib/analysis';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        athlete: { include: { survey: true } }
      }
    });

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const result = await analyzeSession({
      athleteId: session.athleteId,
      sessionId: session.id,
      drillType: session.drillType,
      survey: session.athlete.survey
    });

    const saved = await prisma.analysisResult.upsert({
      where: { sessionId: session.id },
      update: { ...result, createdAt: new Date() },
      create: {
        sessionId: session.id,
        provider: result.provider,
        metrics: result.metrics,
        cues: result.cues,
        reportCard: result.reportCard,
        practicePlan: result.practicePlan
      }
    });

    return NextResponse.json({ analysis: saved, mode: isMockMode() ? 'mock' : 'openai' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
