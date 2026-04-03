import { useState } from 'react';
import type { CreateTodoRequest, UpdateTodoRequest } from './types/todo';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Layout/Header';
import { TodoStats } from './components/TodoStats/TodoStats';
import { TodoFiltersBar } from './components/TodoList/TodoFilters';
import { TodoList } from './components/TodoList/TodoList';
import { TodoForm } from './components/TodoForm/TodoForm';

function App() {
  const {
    data,
    summary,
    loading,
    error,
    filters,
    setFilters,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    editingTodo,
    setEditingTodo,
  } = useTodos();

  const [showForm, setShowForm] = useState(false);

  const openNew = () => {
    setEditingTodo(null);
    setShowForm(true);
  };

  const openEdit = (todo: Parameters<typeof setEditingTodo>[0]) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  const handleSubmit = async (body: CreateTodoRequest | UpdateTodoRequest) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, body as UpdateTodoRequest);
    } else {
      await createTodo(body as CreateTodoRequest);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewTask={openNew} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        {summary && !error && <TodoStats summary={summary} />}

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Filters */}
        <TodoFiltersBar
          filters={filters}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        />

        {/* Task list */}
        <TodoList
          data={data}
          loading={loading}
          filters={filters}
          onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          onToggle={(id) => { void toggleTodo(id); }}
          onEdit={openEdit}
          onDelete={deleteTodo}
          onNewTask={openNew}
        />
      </main>

      {/* Task form modal */}
      {showForm && (
        <TodoForm editing={editingTodo} onSubmit={handleSubmit} onClose={closeForm} />
      )}
    </div>
  );
}

export default App;
