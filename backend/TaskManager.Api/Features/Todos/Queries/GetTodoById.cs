using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Exceptions;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Mapping;

namespace TaskManager.Api.Features.Todos.Queries;

public sealed record GetTodoByIdQuery(Guid Id) : IRequest<TodoResponse>;

public sealed class GetTodoByIdHandler : IRequestHandler<GetTodoByIdQuery, TodoResponse>
{
    private readonly AppDbContext _db;

    public GetTodoByIdHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TodoResponse> Handle(GetTodoByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _db.TodoItems.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (entity is null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        return entity.ToResponse();
    }
}
