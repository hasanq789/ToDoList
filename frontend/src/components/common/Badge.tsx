import type { Priority } from '../../types/todo';
import { CATEGORY_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '../../types/todo';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 ring-1 ring-red-200">
      Overdue
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const colorClass = (CATEGORY_COLORS as Record<string, string>)[category] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {category}
    </span>
  );
}
