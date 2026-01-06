import Link from 'next/link';
import { getDashboardOverview } from '../lib/dashboard';
import { ProgramStats } from '../components/program-stats';
import { AthleteList } from '../components/athlete-list';

export default async function Home() {
  const overview = await getDashboardOverview();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Picture Day → Analysis → Play</h1>
        <p className="text-gray-300">
          Capture drills, personalize with quick survey, run mock analysis, and present athlete + coach dashboards that are ready for upstream reporting.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-gray-200">
          <Link className="button" href="/athletes/new">
            Create Athlete
          </Link>
          <Link className="button bg-secondary hover:bg-sky-500" href="/coach">
            Coach Dashboard
          </Link>
        </div>
      </section>

      <ProgramStats stats={overview} />

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Athletes</h2>
          <Link className="text-sm text-secondary" href="/athletes">
            Manage athletes
          </Link>
        </div>
        <AthleteList athletes={overview.athletes} />
      </div>
    </div>
  );
}
