import { prisma } from '@/lib/db';
import { getCoachStats } from '@/lib/dashboard';
import { revalidatePath } from 'next/cache';

async function createProgram(formData: FormData) {
  'use server';
  const name = formData.get('name')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  if (!name) throw new Error('Name required');
  await prisma.program.create({ data: { name, description } });
  revalidatePath('/coach');
}

export default async function CoachPage() {
  const stats = await getCoachStats();
  const programs = await prisma.program.findMany({ include: { athletes: true } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Coach / Program Dashboard</h1>
          <p className="text-sm text-gray-400">Participation, improvement distribution, and exportable summaries.</p>
        </div>
        <a className="button" href="/api/export/csv">
          Export CSV
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="text-sm text-gray-400">Programs</div>
          <div className="text-2xl font-semibold">{programs.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400">Sessions</div>
          <div className="text-2xl font-semibold">{stats.sessionCount}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400">Improvement bucket (power)</div>
          <div className="text-xs text-gray-300 space-y-1 mt-1">
            {Object.entries(stats.improvementBuckets).map(([range, count]) => (
              <div key={range} className="flex justify-between">
                <span>{range}</span>
                <span className="font-semibold text-secondary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Programs</h2>
          <form action={createProgram} className="flex gap-2 text-sm">
            <input name="name" className="input" placeholder="Program name" required />
            <input name="description" className="input" placeholder="Description" />
            <button className="button" type="submit">Create</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Athletes</th>
                <th>Sessions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className="border-t border-gray-800">
                  <td>{program.name}</td>
                  <td>{program.athletes.length}</td>
                  <td>
                    {program.athletes.reduce((acc, athlete) => acc + athlete.sessions.length, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold">PR video prep checklist</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          <li>Highlight reel placeholder ready (uploaded clip)</li>
          <li>Latest report card exported for program director</li>
          <li>Caption overlays aligned to deck narrative</li>
        </ul>
      </div>
    </div>
  );
}
