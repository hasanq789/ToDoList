using TaskManager.Api.Domain.Enums;

namespace TaskManager.Api.Features.Todos.DTOs;

public sealed record UpdateTodoRequest(
    string Title,
    string? Description,
    bool IsCompleted,
    Priority Priority,
    DateTime? DueDate,
    string? Category);
