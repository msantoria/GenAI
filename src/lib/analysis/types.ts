import { DrillType, SurveyResponse } from '@prisma/client';

type Metrics = Record<string, number>;

export interface AnalysisResultPayload {
  provider: string;
  metrics: Metrics;
  cues: string[];
  reportCard: Record<string, number>;
  practicePlan: string;
}

export interface AnalysisProvider {
  analyze: (input: {
    athleteId: number;
    sessionId: number;
    drillType: DrillType;
    survey?: SurveyResponse | null;
  }) => Promise<AnalysisResultPayload>;
}
