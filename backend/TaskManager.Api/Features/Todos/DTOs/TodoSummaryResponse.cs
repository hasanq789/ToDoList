using TaskManager.Api.Domain.Enums;

namespace TaskManager.Api.Features.Todos.DTOs;

public record TodoSummaryResponse(
    int Total,
    int Completed,
    int Pending,
    int Overdue,
    IReadOnlyDictionary<Priority, int> CountByPriority);
