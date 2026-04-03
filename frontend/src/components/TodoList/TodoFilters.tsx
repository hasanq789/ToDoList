import type { DueFilter, TodoFilters } from '../../types/todo';
import { CATEGORIES } from '../../types/todo';

interface TodoFiltersProps {
  filters: TodoFilters;
  onChange: (patch: Partial<TodoFilters>) => void;
}

interface QuickFilterBtn {
  value: DueFilter;
  label: string;
  icon: string;
}

const QUICK_FILTERS: QuickFilterBtn[] = [
  { value: 'Today', label: 'Due Today', icon: '📅' },
  { value: 'ThisWeek', label: 'Due This Week', icon: '📆' },
];

export function TodoFiltersBar({ filters, onChange }: TodoFiltersProps) {
  const toggleDueFilter = (value: DueFilter) => {
    onChange({ dueFilter: filters.dueFilter === value ? '' : value, page: 1 });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      {/* Quick due-date filter pills */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map(({ value, label, icon }) => {
          const active = filters.dueFilter === value;
          return (
            <button
              key={value}
              onClick={() => toggleDueFilter(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
              }`}
              aria-pressed={active}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
              {active && (
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Main filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="sr-only">Search tasks</label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search"
              type="search"
              placeholder="Search tasks…"
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value, page: 1 })}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Priority filter */}
        <div>
          <label htmlFor="priority-filter" className="sr-only">Filter by priority</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value as TodoFilters['priority'], page: 1 })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            value={filters.isCompleted}
            onChange={(e) => onChange({ isCompleted: e.target.value as TodoFilters['isCompleted'], page: 1 })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">All Statuses</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>
        </div>
      </div>

      {/* Category + Sort row */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-xs text-gray-500 whitespace-nowrap">
            Category:
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value as TodoFilters['category'], page: 1 })}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-xs text-gray-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value, page: 1 })}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Sort direction */}
        <button
          onClick={() => onChange({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc', page: 1 })}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          aria-label="Toggle sort direction"
        >
          {filters.sortDirection === 'asc' ? (
            <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>Asc</>
          ) : (
            <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>Desc</>
          )}
        </button>
      </div>
    </div>
  );
}
