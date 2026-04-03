import type { TodoSummary } from '../../types/todo';

interface TodoStatsProps {
  summary: TodoSummary;
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function TodoStats({ summary }: TodoStatsProps) {
  const completionPct =
    summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <section aria-label="Task statistics" className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <StatCard label="Total" value={summary.total} color="text-gray-900" />
        <StatCard label="Completed" value={summary.completed} color="text-green-600" />
        <StatCard label="Pending" value={summary.pending} color="text-indigo-600" />
        <StatCard label="Overdue" value={summary.overdue} color="text-red-600" />
      </div>

      {summary.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
            <span>Progress</span>
            <span>{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            {(['Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
              <span key={p} className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{summary.countByPriority[p]}</span>{' '}
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
