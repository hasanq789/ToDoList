import { useCallback, useEffect, useRef, useState } from 'react';
import { todoApi } from '../services/api';
import type {
  CreateTodoRequest,
  PagedResponse,
  TodoFilters,
  TodoItem,
  TodoSummary,
  UpdateTodoRequest,
} from '../types/todo';
import { DEFAULT_FILTERS } from '../types/todo';
import { useDebounce } from './useDebounce';

interface UseTodosState {
  data: PagedResponse<TodoItem> | null;
  summary: TodoSummary | null;
  loading: boolean;
  error: string | null;
}

export interface UseTodosReturn extends UseTodosState {
  filters: TodoFilters;
  setFilters: React.Dispatch<React.SetStateAction<TodoFilters>>;
  refresh: () => void;
  createTodo: (body: CreateTodoRequest) => Promise<void>;
  updateTodo: (id: string, body: UpdateTodoRequest) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  editingTodo: TodoItem | null;
  setEditingTodo: (todo: TodoItem | null) => void;
}

export function useTodos(): UseTodosReturn {
  const [state, setState] = useState<UseTodosState>({
    data: null,
    summary: null,
    loading: true,
    error: null,
  });
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const debouncedSearch = useDebounce(filters.search, 350);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const effectiveFilters = { ...filters, search: debouncedSearch };
      const [data, summary] = await Promise.all([
        todoApi.list(effectiveFilters),
        todoApi.summary(),
      ]);
      if (!controller.signal.aborted) {
        setState({ data, summary, loading: false, error: null });
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    void fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  const createTodo = useCallback(async (body: CreateTodoRequest) => {
    await todoApi.create(body);
    void fetchAll();
  }, [fetchAll]);

  const updateTodo = useCallback(async (id: string, body: UpdateTodoRequest) => {
    await todoApi.update(id, body);
    void fetchAll();
  }, [fetchAll]);

  const toggleTodo = useCallback(async (id: string) => {
    // optimistic update
    setState((prev) => {
      if (!prev.data) return prev;
      const items = prev.data.items.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      );
      return { ...prev, data: { ...prev.data, items } };
    });
    try {
      await todoApi.toggle(id);
      void fetchAll();
    } catch (err) {
      // revert on failure
      setState((prev) => {
        if (!prev.data) return prev;
        const items = prev.data.items.map((t) =>
          t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
        );
        return {
          ...prev,
          data: { ...prev.data, items },
          error: err instanceof Error ? err.message : 'Toggle failed',
        };
      });
    }
  }, [fetchAll]);

  const deleteTodo = useCallback(async (id: string) => {
    await todoApi.delete(id);
    void fetchAll();
  }, [fetchAll]);

  return {
    ...state,
    filters,
    setFilters,
    refresh: fetchAll,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    editingTodo,
    setEditingTodo,
  };
}
