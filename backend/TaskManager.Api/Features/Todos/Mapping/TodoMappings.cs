using TaskManager.Api.Domain.Entities;
using TaskManager.Api.Features.Todos.DTOs;

namespace TaskManager.Api.Features.Todos.Mapping;

public static class TodoMappings
{
    public static TodoResponse ToResponse(this TodoItem entity)
    {
        var utcNow = DateTime.UtcNow;
        var isOverdue = entity.DueDate.HasValue
            && !entity.IsCompleted
            && entity.DueDate.Value.Date < utcNow.Date;

        return new TodoResponse(
            entity.Id,
            entity.Title,
            entity.Description,
            entity.IsCompleted,
            entity.Priority,
            entity.DueDate,
            entity.Category,
            entity.CreatedAt,
            entity.UpdatedAt,
            isOverdue);
    }
}
