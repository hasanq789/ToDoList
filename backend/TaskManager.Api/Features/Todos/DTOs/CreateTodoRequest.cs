using TaskManager.Api.Domain.Enums;

namespace TaskManager.Api.Features.Todos.DTOs;

public sealed record CreateTodoRequest(
    string Title,
    string? Description,
    Priority Priority,
    DateTime? DueDate,
    string? Category);
