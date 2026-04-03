import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoForm } from '../components/TodoForm/TodoForm';
import type { TodoItem } from '../types/todo';

const editingTodo: TodoItem = {
  id: 'abc',
  title: 'Existing task',
  description: 'Some description',
  isCompleted: false,
  priority: 'High',
  dueDate: null,
  category: 'Work',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isOverdue: false,
};

describe('TodoForm', () => {
  it('renders with empty fields for new task', () => {
    render(<TodoForm editing={null} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(<TodoForm editing={null} onSubmit={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm editing={null} onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My task' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My task', priority: 'Medium' })
      );
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<TodoForm editing={null} onSubmit={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('populates fields when editing an existing todo', () => {
    render(<TodoForm editing={editingTodo} onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing task');
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('Work');
  });

  it('renders category as a select with predefined options', () => {
    render(<TodoForm editing={null} onSubmit={vi.fn()} onClose={vi.fn()} />);
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    const options = Array.from(categorySelect.options).map((o) => o.value);
    expect(options).toContain('Work');
    expect(options).toContain('Personal');
    expect(options).toContain('Health');
    expect(options).toContain('Other');
  });
});
