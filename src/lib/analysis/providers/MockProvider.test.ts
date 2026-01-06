import { MockProvider } from './MockProvider';
import { DrillType } from '@prisma/client';

const provider = new MockProvider();

test('MockProvider is deterministic for same inputs', async () => {
  const result1 = await provider.analyze({ athleteId: 1, sessionId: 1, drillType: DrillType.SPRINT, survey: null });
  const result2 = await provider.analyze({ athleteId: 1, sessionId: 1, drillType: DrillType.SPRINT, survey: null });

  expect(result1.metrics).toEqual(result2.metrics);
  expect(result1.reportCard).toEqual(result2.reportCard);
  expect(result1.cues).toEqual(result2.cues);
});
