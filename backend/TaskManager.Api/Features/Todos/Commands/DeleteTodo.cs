using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Exceptions;

namespace TaskManager.Api.Features.Todos.Commands;

public sealed record DeleteTodoCommand(Guid Id) : IRequest;

public sealed class DeleteTodoHandler : IRequestHandler<DeleteTodoCommand>
{
    private readonly AppDbContext _db;

    public DeleteTodoHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteTodoCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.TodoItems.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (entity is null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        _db.TodoItems.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
