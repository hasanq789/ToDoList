using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Entities;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Mapping;

namespace TaskManager.Api.Features.Todos.Queries;

public sealed record GetTodosQuery(
    string? Search,
    Priority? Priority,
    bool? IsCompleted,
    string? Category,
    string? SortBy,
    string? SortDirection,
    int Page = 1,
    int PageSize = 10,
    DueFilter? Due = null) : IRequest<PagedResponse<TodoResponse>>;

public sealed class GetTodosQueryValidator : AbstractValidator<GetTodosQuery>
{
    public GetTodosQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}

public sealed class GetTodosHandler : IRequestHandler<GetTodosQuery, PagedResponse<TodoResponse>>
{
    private readonly AppDbContext _db;

    public GetTodosHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<TodoResponse>> Handle(GetTodosQuery request, CancellationToken cancellationToken)
    {
        IQueryable<TodoItem> query = _db.TodoItems.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim();
            query = query.Where(t =>
                t.Title.Contains(s, StringComparison.OrdinalIgnoreCase)
                || (t.Description != null && t.Description.Contains(s, StringComparison.OrdinalIgnoreCase)));
        }

        if (request.Priority.HasValue)
        {
            var p = request.Priority.Value;
            query = query.Where(t => t.Priority == p);
        }

        if (request.IsCompleted.HasValue)
        {
            var c = request.IsCompleted.Value;
            query = query.Where(t => t.IsCompleted == c);
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var cat = request.Category.Trim();
            query = query.Where(t => t.Category != null && t.Category.Equals(cat, StringComparison.OrdinalIgnoreCase));
        }

        if (request.Due.HasValue)
        {
            var today = DateTime.UtcNow.Date;
            if (request.Due.Value == DueFilter.Today)
            {
                query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date == today);
            }
            else if (request.Due.Value == DueFilter.ThisWeek)
            {
                var weekEnd = today.AddDays(7);
                query = query.Where(t => t.DueDate.HasValue
                    && t.DueDate.Value.Date >= today
                    && t.DueDate.Value.Date < weekEnd);
            }
        }

        var sortBy = string.IsNullOrWhiteSpace(request.SortBy) ? "createdAt" : request.SortBy.Trim();
        var desc = string.Equals(request.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        if (string.Equals(sortBy, "title", StringComparison.OrdinalIgnoreCase))
        {
            query = desc ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title);
        }
        else if (string.Equals(sortBy, "duedate", StringComparison.OrdinalIgnoreCase))
        {
            query = desc ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate);
        }
        else if (string.Equals(sortBy, "priority", StringComparison.OrdinalIgnoreCase))
        {
            query = desc ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority);
        }
        else if (string.Equals(sortBy, "updatedat", StringComparison.OrdinalIgnoreCase))
        {
            query = desc ? query.OrderByDescending(t => t.UpdatedAt) : query.OrderBy(t => t.UpdatedAt);
        }
        else
        {
            query = desc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt);
        }

        var total = await query.CountAsync(cancellationToken);
        var page = request.Page;
        var pageSize = request.PageSize;
        var list = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(total / (double)pageSize);
        var responses = list.Select(x => x.ToResponse()).ToList();

        return new PagedResponse<TodoResponse>(responses, page, pageSize, total, totalPages);
    }
}
