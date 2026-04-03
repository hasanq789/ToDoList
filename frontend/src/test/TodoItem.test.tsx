import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoItem } from '../components/TodoList/TodoItem';
import type { TodoItem as TodoItemType } from '../types/todo';

const base: TodoItemType = {
  id: '1',
  title: 'Test task',
  description: null,
  isCompleted: false,
  priority: 'Medium',
  dueDate: null,
  category: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isOverdue: false,
};

describe('TodoItem', () => {
  it('renders the task title', () => {
    render(
      <TodoItem todo={base} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn().mockResolvedValue(undefined)} />
    );
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('shows priority badge', () => {
    render(
      <TodoItem todo={base} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn().mockResolvedValue(undefined)} />
    );
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox button clicked', () => {
    const onToggle = vi.fn();
    render(
      <TodoItem todo={base} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn().mockResolvedValue(undefined)} />
    );
    fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('shows completed styling and "Mark incomplete" label when done', () => {
    render(
      <TodoItem
        todo={{ ...base, isCompleted: true }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByRole('button', { name: /mark incomplete/i })).toBeInTheDocument();
  });

  it('shows Overdue badge when isOverdue is true', () => {
    render(
      <TodoItem
        todo={{ ...base, isOverdue: true }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders colored CategoryBadge when category is set', () => {
    render(
      <TodoItem
        todo={{ ...base, category: 'Work' }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />
    );
    const badge = screen.getByText('Work');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/bg-blue/);
  });

  it('does not render category badge when category is null', () => {
    render(
      <TodoItem todo={base} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn().mockResolvedValue(undefined)} />
    );
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
  });
});
