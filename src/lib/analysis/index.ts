import { DrillType, SurveyResponse } from '@prisma/client';
import { AnalysisProvider, AnalysisResultPayload } from './types';
import { MockProvider } from './providers/MockProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';

const mockProvider = new MockProvider();
let openAIProvider: AnalysisProvider | null = null;

if (process.env.OPENAI_API_KEY) {
  openAIProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
}

export async function analyzeSession(params: {
  athleteId: number;
  sessionId: number;
  drillType: DrillType;
  survey?: SurveyResponse | null;
}): Promise<AnalysisResultPayload> {
  const provider = openAIProvider || mockProvider;
  try {
    const result = await provider.analyze(params);
    return result;
  } catch (err) {
    console.error('Primary provider failed, falling back to mock', err);
    return mockProvider.analyze(params);
  }
}

export function isMockMode() {
  return !process.env.OPENAI_API_KEY;
}
