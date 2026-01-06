import { DrillType, SurveyResponse } from '@prisma/client';
import { AnalysisProvider, AnalysisResultPayload } from '../types';

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateMetric(seed: number, base: number) {
  return Math.round((base + pseudoRandom(seed) * 30 + (seed % 10)) % 100);
}

const cueTemplates: Record<DrillType, string[]> = {
  SPRINT: ['Drive knees higher', 'Lean slightly forward', 'Explode through first 5 yards'],
  SHUFFLE: ['Lower hips to stay balanced', 'Keep feet light', 'Eyes forward, hands ready'],
  JUMP: ['Load hips before takeoff', 'Swing arms for momentum', 'Land softly on midfoot'],
  THROW: ['Lead with hips then shoulders', 'Finish with full extension', 'Stay tall through release'],
  KICK: ['Plant foot beside the ball', 'Lock ankle on contact', 'Follow through toward target'],
  SHOOTING: ['Balance feet before release', 'Elbow under the ball', 'Hold your follow-through']
};

function buildPracticePlan(drillType: DrillType, survey?: SurveyResponse | null) {
  const theme = survey?.avatarTheme ?? 'pro';
  const motivation = survey?.motivationStyle ?? 'coach feedback';
  return `Individual focus: 3 x 30s ${drillType.toLowerCase()} form with video check. Team focus: relay-style ${drillType.toLowerCase()} with points. Theme: ${theme}. Motivation: ${motivation}.`;
}

export class MockProvider implements AnalysisProvider {
  name = 'mock';

  async analyze({ athleteId, sessionId, drillType, survey }: { athleteId: number; sessionId: number; drillType: DrillType; survey?: SurveyResponse | null; }): Promise<AnalysisResultPayload> {
    const seed = athleteId * 37 + sessionId * 17 + drillType.length;
    const metrics = {
      'hip depth score': generateMetric(seed, 60),
      'knee valgus risk': generateMetric(seed + 1, 40),
      'arm slot consistency': generateMetric(seed + 2, 55),
      tempo: generateMetric(seed + 3, 50),
      balance: generateMetric(seed + 4, 65),
      'explosiveness index': generateMetric(seed + 5, 70)
    };

    const cues = cueTemplates[drillType].slice(0, 3);
    const reportCard = {
      power: generateMetric(seed + 6, 65),
      control: generateMetric(seed + 7, 55),
      efficiency: generateMetric(seed + 8, 60),
      resilience: generateMetric(seed + 9, 50),
      readiness: generateMetric(seed + 10, 75)
    };
    const practicePlan = buildPracticePlan(drillType, survey);

    return { provider: 'MockProvider', metrics, cues, reportCard, practicePlan };
  }
}
