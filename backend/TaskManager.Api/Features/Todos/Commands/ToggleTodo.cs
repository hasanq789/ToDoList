using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Exceptions;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Mapping;

namespace TaskManager.Api.Features.Todos.Commands;

public sealed record ToggleTodoCommand(Guid Id) : IRequest<TodoResponse>;

public sealed class ToggleTodoHandler : IRequestHandler<ToggleTodoCommand, TodoResponse>
{
    private readonly AppDbContext _db;

    public ToggleTodoHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TodoResponse> Handle(ToggleTodoCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.TodoItems.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (entity is null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        entity.IsCompleted = !entity.IsCompleted;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return entity.ToResponse();
    }
}
