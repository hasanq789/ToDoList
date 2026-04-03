export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export const CATEGORIES = [
  'Work',
  'Personal',
  'Career',
  'Health',
  'Finance',
  'Learning',
  'Home',
  'Shopping',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type DueFilter = 'Today' | 'ThisWeek';

export interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: Priority;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TodoSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  countByPriority: Record<Priority, number>;
}

export interface CreateTodoRequest {
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  category?: string | null;
}

export interface UpdateTodoRequest {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string | null;
  category?: string | null;
}

export interface TodoFilters {
  search: string;
  priority: Priority | '';
  isCompleted: '' | 'true' | 'false';
  category: Category | '';
  dueFilter: DueFilter | '';
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTERS: TodoFilters = {
  search: '',
  priority: '',
  isCompleted: '',
  category: '',
  dueFilter: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-amber-100 text-amber-700',
  Critical: 'bg-red-100 text-red-700',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Work: 'bg-blue-100 text-blue-700',
  Personal: 'bg-purple-100 text-purple-700',
  Career: 'bg-indigo-100 text-indigo-700',
  Health: 'bg-green-100 text-green-700',
  Finance: 'bg-yellow-100 text-yellow-800',
  Learning: 'bg-cyan-100 text-cyan-700',
  Home: 'bg-orange-100 text-orange-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Other: 'bg-gray-100 text-gray-600',
};
