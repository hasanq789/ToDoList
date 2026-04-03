import type { PagedResponse, TodoFilters, TodoItem as TodoItemType } from '../../types/todo';
import { EmptyState } from '../common/EmptyState';
import { Spinner } from '../common/Spinner';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  data: PagedResponse<TodoItemType> | null;
  loading: boolean;
  filters: TodoFilters;
  onFiltersChange: (patch: Partial<TodoFilters>) => void;
  onToggle: (id: string) => void;
  onEdit: (todo: TodoItemType) => void;
  onDelete: (id: string) => Promise<void>;
  onNewTask: () => void;
}

export function TodoList({
  data,
  loading,
  filters,
  onFiltersChange,
  onToggle,
  onEdit,
  onDelete,
  onNewTask,
}: TodoListProps) {
  const hasItems = data && data.items.length > 0;
  const isEmpty = data && data.items.length === 0 && !loading;
  const isFiltered =
    filters.search !== '' ||
    filters.priority !== '' ||
    filters.isCompleted !== '' ||
    filters.category !== '' ||
    filters.dueFilter !== '';

  return (
    <div>
      {/* Loading overlay for subsequent fetches */}
      {loading && data && (
        <div className="flex justify-center py-4">
          <Spinner className="w-5 h-5 text-indigo-500" />
        </div>
      )}

      {/* Initial loading skeleton */}
      {loading && !data && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <EmptyState
          title={isFiltered ? 'No matching tasks' : 'No tasks yet'}
          description={
            isFiltered ? 'Try adjusting your filters.' : 'Create your first task to get started.'
          }
          action={
            !isFiltered ? (
              <button
                onClick={onNewTask}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                New Task
              </button>
            ) : undefined
          }
        />
      )}

      {hasItems && (
        <>
          <div className="space-y-2">
            {data.items.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Showing {(filters.page - 1) * filters.pageSize + 1}–
                {Math.min(filters.page * filters.pageSize, data.totalCount)} of {data.totalCount}{' '}
                tasks
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onFiltersChange({ page: filters.page - 1 })}
                  disabled={filters.page <= 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
                  {filters.page} / {data.totalPages}
                </span>
                <button
                  onClick={() => onFiltersChange({ page: filters.page + 1 })}
                  disabled={filters.page >= data.totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
