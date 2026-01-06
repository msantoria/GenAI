import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { analyzeSession } from '@/lib/analysis';
import fs from 'fs/promises';
import path from 'path';
import { DrillType } from '@prisma/client';

async function saveSurvey(formData: FormData) {
  'use server';
  const athleteId = Number(formData.get('athleteId'));
  const avatarTheme = formData.get('avatarTheme')?.toString() || '';
  const motivationStyle = formData.get('motivationStyle')?.toString() || '';
  const goals = formData.get('goals')?.toString() || '';
  const confidence = Number(formData.get('confidence')) || 1;
  const injuries = formData.get('injuries')?.toString() || undefined;

  await prisma.surveyResponse.upsert({
    where: { athleteId },
    update: { avatarTheme, motivationStyle, goals, confidence, injuries },
    create: { athleteId, avatarTheme, motivationStyle, goals, confidence, injuries }
  });

  revalidatePath(`/athletes/${athleteId}`);
}

async function createSession(formData: FormData) {
  'use server';
  const athleteId = Number(formData.get('athleteId'));
  const drillType = formData.get('drillType')?.toString() as DrillType;
  const sample = formData.get('sample')?.toString();
  const file = formData.get('video') as unknown as File | null;

  if (!athleteId || !drillType) throw new Error('Missing fields');

  let videoPath = '';
  let usedSample = false;

  if (sample && sample !== 'upload') {
    videoPath = `/sample_videos/${sample}`;
    usedSample = true;
  } else if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const storageDir = path.join(process.cwd(), 'public', 'storage', 'uploads');
    await fs.mkdir(storageDir, { recursive: true });
    const filename = `${Date.now()}-${file.name}`;
    const fullPath = path.join(storageDir, filename);
    await fs.writeFile(fullPath, bytes);
    videoPath = `/storage/uploads/${filename}`;
  } else {
    throw new Error('Provide a video or choose a sample');
  }

  await prisma.session.create({
    data: { athleteId, drillType, videoPath, usedSample }
  });

  revalidatePath(`/athletes/${athleteId}`);
}

async function analyze(formData: FormData) {
  'use server';
  const sessionId = Number(formData.get('sessionId'));
  const athleteId = Number(formData.get('athleteId'));
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { athlete: { include: { survey: true } } }
  });
  if (!session) throw new Error('Session not found');

  const result = await analyzeSession({
    athleteId: session.athleteId,
    sessionId: session.id,
    drillType: session.drillType,
    survey: session.athlete.survey
  });

  await prisma.analysisResult.upsert({
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

  revalidatePath(`/athletes/${athleteId}`);
}

async function getAthlete(id: number) {
  return prisma.athlete.findUnique({
    where: { id },
    include: {
      survey: true,
      program: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        include: { analysis: true }
      }
    }
  });
}

export default async function AthleteDetail({ params }: { params: { id: string } }) {
  const athleteId = Number(params.id);
  const athlete = await getAthlete(athleteId);
  if (!athlete) return notFound();

  const latestSession = athlete.sessions[0];
  const latestAnalysis = latestSession?.analysis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{athlete.name}</h1>
          <p className="text-sm text-gray-400">
            {athlete.sportFocus} • Age band {athlete.ageBand.replace('AGE_', '').replace('_', '-')} • Program: {athlete.program.name}
          </p>
          <p className="text-xs text-gray-500">Level {athlete.level} • XP {athlete.xp}</p>
        </div>
        <div className="text-sm text-gray-400">
          Baseline: {athlete.baselineDate ? new Date(athlete.baselineDate).toLocaleDateString() : 'Not set'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Quick survey (Picture Day)</h2>
            <span className="text-xs text-gray-500">Personalization context</span>
          </div>
          <form action={saveSurvey} className="space-y-3">
            <input type="hidden" name="athleteId" value={athlete.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="label">Avatar style</span>
                <select name="avatarTheme" className="input" defaultValue={athlete.survey?.avatarTheme} required>
                  <option value="superhero">Superhero</option>
                  <option value="pro athlete">Pro athlete</option>
                  <option value="minimalist">Minimalist</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="label">Motivation</span>
                <select name="motivationStyle" className="input" defaultValue={athlete.survey?.motivationStyle} required>
                  <option value="rewards">Rewards/levels</option>
                  <option value="coach feedback">Coach feedback</option>
                  <option value="social competition">Social competition</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="label">Goals</span>
                <input name="goals" className="input" defaultValue={athlete.survey?.goals} placeholder="speed, shooting, agility" required />
              </label>
              <label className="space-y-1">
                <span className="label">Confidence (1-5)</span>
                <input name="confidence" type="number" min="1" max="5" className="input" defaultValue={athlete.survey?.confidence ?? 3} required />
              </label>
            </div>
            <label className="space-y-1">
              <span className="label">Injuries/constraints</span>
              <input name="injuries" className="input" defaultValue={athlete.survey?.injuries || ''} />
            </label>
            <button className="button" type="submit">
              Save survey
            </button>
          </form>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Create capture session</h2>
            <span className="text-xs text-gray-500">Upload or select sample</span>
          </div>
          <form action={createSession} className="space-y-3" encType="multipart/form-data">
            <input type="hidden" name="athleteId" value={athlete.id} />
            <label className="space-y-1">
              <span className="label">Drill type</span>
              <select name="drillType" className="input" required>
                {Object.values(DrillType).map((type) => (
                  <option key={type} value={type}>
                    {type.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="label">Sample video</span>
              <select name="sample" className="input" defaultValue="sprint.mp4">
                <option value="upload">Upload my own</option>
                <option value="sprint.mp4">Sprint sample</option>
                <option value="shuffle.mp4">Shuffle sample</option>
                <option value="shot.mp4">Shooting form sample</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="label">Or upload</span>
              <input type="file" name="video" className="input" accept="video/*" />
            </label>
            <button className="button" type="submit">
              Create session
            </button>
          </form>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Sessions & analysis</h2>
          <span className="text-xs text-gray-500">Deterministic mock analysis for demo</span>
        </div>
        <div className="space-y-3">
          {athlete.sessions.map((session) => (
            <div key={session.id} className="rounded-lg border border-gray-800 p-3">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <div>
                  <div className="font-semibold">{session.drillType.toLowerCase()} • {new Date(session.createdAt).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Video: {session.videoPath}</div>
                </div>
                <form action={analyze}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <input type="hidden" name="athleteId" value={athlete.id} />
                  <button className="button" type="submit">
                    {session.analysis ? 'Re-run analysis' : 'Analyze'}
                  </button>
                </form>
              </div>
              {session.analysis && (
                <div className="mt-2 grid gap-3 md:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-semibold">Metrics</h4>
                    <ul className="text-xs text-gray-300">
                      {Object.entries(session.analysis.metrics as Record<string, number>).map(([k, v]) => (
                        <li key={k} className="flex justify-between">
                          <span>{k}</span>
                          <span className="font-semibold text-secondary">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Coach cues</h4>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-gray-300">
                      {(session.analysis.cues as string[]).map((cue, idx) => (
                        <li key={idx}>{cue}</li>
                      ))}
                    </ul>
                    <h4 className="mt-3 text-sm font-semibold">Practice plan</h4>
                    <p className="text-xs text-gray-300">{session.analysis.practicePlan}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Report card</h4>
                    <ul className="text-xs text-gray-300">
                      {Object.entries(session.analysis.reportCard as Record<string, number>).map(([k, v]) => (
                        <li key={k} className="flex justify-between">
                          <span>{k}</span>
                          <span className="font-semibold text-secondary">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!athlete.sessions.length && <p className="text-sm text-gray-400">No sessions yet. Create one to run analysis.</p>}
        </div>
      </div>

      {latestSession && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-2">
            <h3 className="font-semibold">Compare & contrast</h3>
            <div className="text-xs text-gray-400">Side-by-side with reference clip</div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-black/40 p-3 text-center text-xs text-gray-400">
                Uploaded clip placeholder
              </div>
              <div className="rounded-lg bg-black/40 p-3 text-center text-xs text-gray-400">
                Reference form clip
              </div>
            </div>
            <p className="text-xs text-gray-400">Caption overlays: {(latestAnalysis?.cues as string[] | undefined)?.join(' • ') || 'Run analysis to view'}
            </p>
          </div>
          <div className="card space-y-2">
            <h3 className="font-semibold">Progression (Play)</h3>
            <div className="text-xs text-gray-400">Levels 1-10, XP badges when reviewing report</div>
            <div className="h-3 rounded-full bg-gray-800">
              <div className="h-3 rounded-full bg-secondary" style={{ width: `${Math.min(100, (athlete.level / 10) * 100)}%` }} />
            </div>
            <div className="text-xs text-gray-300">Level {athlete.level} • {athlete.xp} XP</div>
            <div className="text-xs text-gray-400">Next recommended drill: {latestSession.drillType.toLowerCase()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
