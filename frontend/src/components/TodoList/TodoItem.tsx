import { useState } from 'react';
import type { TodoItem as TodoItemType } from '../../types/todo';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CategoryBadge, OverdueBadge, PriorityBadge } from '../common/Badge';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onEdit: (todo: TodoItemType) => void;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        className={`group bg-white rounded-xl border transition-all duration-150 ${
          todo.isCompleted
            ? 'border-gray-100 opacity-70'
            : todo.isOverdue
            ? 'border-red-200 bg-red-50/30'
            : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
        }`}
        data-testid="todo-item"
      >
        <div className="p-4 flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id)}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              todo.isCompleted
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 hover:border-indigo-500'
            }`}
            aria-label={todo.isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {todo.isCompleted && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h3
                className={`text-sm font-medium leading-snug ${
                  todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {todo.title}
              </h3>
              <div className="flex flex-wrap gap-1">
                <PriorityBadge priority={todo.priority} />
                {todo.isOverdue && <OverdueBadge />}
              </div>
            </div>

            {todo.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{todo.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {todo.category && <CategoryBadge category={todo.category} />}
              {todo.dueDate && (
                <span
                  className={`text-xs ${todo.isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}
                >
                  Due {formatDate(todo.dueDate)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(todo)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label={`Edit "${todo.title}"`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              aria-label={`Delete "${todo.title}"`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete task"
          message={`Are you sure you want to delete "${todo.title}"? This cannot be undone.`}
          confirmLabel={deleting ? 'Deleting…' : 'Delete'}
          dangerous
          onConfirm={() => { void handleDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
