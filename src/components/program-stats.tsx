interface Overview {
  programCount: number;
  athleteCount: number;
  sessionCount: number;
  analyzedSessions: number;
}

const statClasses = 'card space-y-1 border border-gray-800 bg-gray-900';

export function ProgramStats({ stats }: { stats: Overview }) {
  const items = [
    { label: 'Programs', value: stats.programCount },
    { label: 'Athletes', value: stats.athleteCount },
    { label: 'Sessions', value: stats.sessionCount },
    { label: 'Analyzed', value: stats.analyzedSessions }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={statClasses}>
          <div className="text-sm text-gray-400">{item.label}</div>
          <div className="text-2xl font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
