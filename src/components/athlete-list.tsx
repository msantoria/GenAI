import Link from 'next/link';
import { Athlete } from '@prisma/client';

export function AthleteList({ athletes }: { athletes: Athlete[] }) {
  if (!athletes.length) return <p className="text-gray-400">No athletes yet. Create one to begin.</p>;
  return (
    <ul className="divide-y divide-gray-800">
      {athletes.map((athlete) => (
        <li key={athlete.id} className="flex items-center justify-between py-3">
          <div>
            <div className="font-semibold">{athlete.name}</div>
            <div className="text-xs text-gray-400">Sport: {athlete.sportFocus}</div>
          </div>
          <Link className="text-sm text-secondary" href={`/athletes/${athlete.id}`}>
            View
          </Link>
        </li>
      ))}
    </ul>
  );
}
