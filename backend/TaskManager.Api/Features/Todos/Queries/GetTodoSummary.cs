using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.DTOs;

namespace TaskManager.Api.Features.Todos.Queries;

public sealed record GetTodoSummaryQuery : IRequest<TodoSummaryResponse>;

public sealed class GetTodoSummaryHandler : IRequestHandler<GetTodoSummaryQuery, TodoSummaryResponse>
{
    private readonly AppDbContext _db;

    public GetTodoSummaryHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TodoSummaryResponse> Handle(GetTodoSummaryQuery request, CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow.Date;
        var items = await _db.TodoItems.AsNoTracking().ToListAsync(cancellationToken);

        var total = items.Count;
        var completed = items.Count(t => t.IsCompleted);
        var pending = total - completed;
        var overdue = items.Count(t =>
            !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value.Date < utcNow);

        var byPriority = Enum.GetValues<Priority>()
            .ToDictionary(p => p, p => items.Count(t => t.Priority == p));

        return new TodoSummaryResponse(total, completed, pending, overdue, byPriority);
    }
}
