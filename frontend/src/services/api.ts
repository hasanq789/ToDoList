import axios, { AxiosError } from 'axios';
import type {
  CreateTodoRequest,
  PagedResponse,
  TodoFilters,
  TodoItem,
  TodoSummary,
  UpdateTodoRequest,
} from '../types/todo';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { title?: string })?.title ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const todoApi = {
  list(filters: TodoFilters): Promise<PagedResponse<TodoItem>> {
    const params: Record<string, string | number | boolean> = {
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    };
    if (filters.search) params['search'] = filters.search;
    if (filters.priority) params['priority'] = filters.priority;
    if (filters.isCompleted !== '') params['isCompleted'] = filters.isCompleted === 'true';
    if (filters.category) params['category'] = filters.category;
    if (filters.dueFilter) params['due'] = filters.dueFilter;

    return client.get<PagedResponse<TodoItem>>('/todos', { params }).then((r) => r.data);
  },

  get(id: string): Promise<TodoItem> {
    return client.get<TodoItem>(`/todos/${id}`).then((r) => r.data);
  },

  create(body: CreateTodoRequest): Promise<TodoItem> {
    return client.post<TodoItem>('/todos', body).then((r) => r.data);
  },

  update(id: string, body: UpdateTodoRequest): Promise<TodoItem> {
    return client.put<TodoItem>(`/todos/${id}`, body).then((r) => r.data);
  },

  toggle(id: string): Promise<TodoItem> {
    return client.patch<TodoItem>(`/todos/${id}/toggle`).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return client.delete(`/todos/${id}`).then(() => undefined);
  },

  summary(): Promise<TodoSummary> {
    return client.get<TodoSummary>('/todos/summary').then((r) => r.data);
  },
};
