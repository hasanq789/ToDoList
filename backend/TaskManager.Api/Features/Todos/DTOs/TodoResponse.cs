using TaskManager.Api.Domain.Enums;

namespace TaskManager.Api.Features.Todos.DTOs;

public record TodoResponse(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    Priority Priority,
    DateTime? DueDate,
    string? Category,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsOverdue);
