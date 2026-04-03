using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Constants;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Exceptions;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Mapping;

namespace TaskManager.Api.Features.Todos.Commands;

public sealed record UpdateTodoCommand(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    Priority Priority,
    DateTime? DueDate,
    string? Category) : IRequest<TodoResponse>;

public sealed class UpdateTodoValidator : AbstractValidator<UpdateTodoCommand>
{
    public UpdateTodoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Category)
            .Must(c => c == null || TodoCategories.All.Contains(c))
            .WithMessage($"Category must be one of: {string.Join(", ", TodoCategories.All)}");
    }
}

public sealed class UpdateTodoHandler : IRequestHandler<UpdateTodoCommand, TodoResponse>
{
    private readonly AppDbContext _db;

    public UpdateTodoHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TodoResponse> Handle(UpdateTodoCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.TodoItems.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (entity is null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        entity.Title = request.Title.Trim();
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.IsCompleted = request.IsCompleted;
        entity.Priority = request.Priority;
        entity.DueDate = request.DueDate;
        entity.Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim();
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return entity.ToResponse();
    }
}
