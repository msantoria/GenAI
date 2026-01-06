import OpenAI from 'openai';
import { DrillType, SurveyResponse } from '@prisma/client';
import { AnalysisProvider, AnalysisResultPayload } from '../types';

export class OpenAIProvider implements AnalysisProvider {
  client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyze({ drillType, survey, athleteId, sessionId }: { drillType: DrillType; survey?: SurveyResponse | null; athleteId: number; sessionId: number; }): Promise<AnalysisResultPayload> {
    const mockMetrics = {
      'hip depth score': 70,
      'knee valgus risk': 30,
      'arm slot consistency': 65,
      tempo: 55,
      balance: 60,
      'explosiveness index': 72
    };

    const prompt = `You are a concise youth sports coach. Athlete ${athleteId} session ${sessionId}. Given the drill type ${drillType}, survey context ${JSON.stringify(
      survey
    )}, and metrics ${JSON.stringify(mockMetrics)}, write 3-5 short bullet cues, a 5-category report card scored 0-100, and a short individual + team practice plan paragraph. Emphasize safety and encouragement.`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You produce compact, encouraging coaching guidance.' },
        { role: 'user', content: prompt }
      ]
    });

    const text = completion.choices[0]?.message?.content || '';

    const cues = text
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .slice(0, 5);

    const practicePlan = text.slice(0, 400) || 'Coach plan unavailable';

    const reportCard = {
      power: 72,
      control: 68,
      efficiency: 70,
      resilience: 65,
      readiness: 75
    };

    return {
      provider: 'OpenAIProvider',
      metrics: mockMetrics,
      cues: cues.length ? cues : ['Stay balanced', 'Control your tempo', 'Finish the rep strong'],
      reportCard,
      practicePlan
    };
  }
}
