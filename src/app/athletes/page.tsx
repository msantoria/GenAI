import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getAthletes() {
  return prisma.athlete.findMany({
    include: { program: true, survey: true, sessions: { include: { analysis: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function AthletesPage() {
  const athletes = await getAthletes();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Athletes</h1>
        <Link className="button" href="/athletes/new">
          New Athlete
        </Link>
      </div>
      <div className="card divide-y divide-gray-800">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold">{athlete.name}</div>
              <div className="text-xs text-gray-400">
                {athlete.sportFocus} • Program: {athlete.program.name}
              </div>
              <div className="text-xs text-gray-500">
                Sessions: {athlete.sessions.length} | Latest score:{' '}
                {athlete.sessions[0]?.analysis ?
                  (athlete.sessions[0].analysis.reportCard as Record<string, number>).power ?? 'N/A'
                  : 'N/A'}
              </div>
            </div>
            <Link className="text-sm text-secondary" href={`/athletes/${athlete.id}`}>
              View
            </Link>
          </div>
        ))}
        {!athletes.length && <p className="py-6 text-gray-400">No athletes yet.</p>}
      </div>
    </div>
  );
}
