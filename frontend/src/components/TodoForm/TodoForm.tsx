import { useEffect, useState } from 'react';
import type { Category, CreateTodoRequest, Priority, TodoItem, UpdateTodoRequest } from '../../types/todo';
import { CATEGORIES } from '../../types/todo';
import { Spinner } from '../common/Spinner';

interface TodoFormProps {
  editing: TodoItem | null;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

interface FormState {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  category: Category | '';
  isCompleted: boolean;
}

function toIsoDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0] ?? '';
}

export function TodoForm({ editing, onSubmit, onClose }: TodoFormProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    category: '',
    isCompleted: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description ?? '',
        priority: editing.priority,
        dueDate: toIsoDate(editing.dueDate),
        category: (editing.category ?? '') as Category | '',
        isCompleted: editing.isCompleted,
      });
    } else {
      setForm({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        category: '',
        isCompleted: false,
      });
    }
    setErrors({});
    setServerError(null);
  }, [editing]);

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 200) errs.title = 'Title must be 200 characters or fewer';
    if (form.description.length > 2000) errs.description = 'Description must be 2000 characters or fewer';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const payload: CreateTodoRequest | UpdateTodoRequest = editing
          ? ({
            title: form.title.trim(),
            description: form.description.trim() || null,
            isCompleted: form.isCompleted,
            priority: form.priority,
            dueDate: form.dueDate || null,
            category: form.category || null,
          } satisfies UpdateTodoRequest)
        : ({
            title: form.title.trim(),
            description: form.description.trim() || null,
            priority: form.priority,
            dueDate: form.dueDate || null,
            category: form.category || null,
          } satisfies CreateTodoRequest);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="form-title" className="text-base font-semibold text-gray-900">
            {editing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="px-6 py-4 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={200}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              maxLength={2000}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Optional details…"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value as Priority }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category | '' }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date + isCompleted (only in edit mode) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              />
            </div>

            {editing && (
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isCompleted}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isCompleted: e.target.checked }))
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </label>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Spinner className="w-3.5 h-3.5 text-white" />}
              {editing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
