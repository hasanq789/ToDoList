using FluentValidation;
using MediatR;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Constants;
using TaskManager.Api.Domain.Entities;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Mapping;

namespace TaskManager.Api.Features.Todos.Commands;

public sealed record CreateTodoCommand(
    string Title,
    string? Description,
    Priority Priority,
    DateTime? DueDate,
    string? Category) : IRequest<TodoResponse>;

public sealed class CreateTodoValidator : AbstractValidator<CreateTodoCommand>
{
    public CreateTodoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Category)
            .Must(c => c == null || TodoCategories.All.Contains(c))
            .WithMessage($"Category must be one of: {string.Join(", ", TodoCategories.All)}");
    }
}

public sealed class CreateTodoHandler : IRequestHandler<CreateTodoCommand, TodoResponse>
{
    private readonly AppDbContext _db;

    public CreateTodoHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TodoResponse> Handle(CreateTodoCommand request, CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow;
        var entity = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            IsCompleted = false,
            Priority = request.Priority,
            DueDate = request.DueDate,
            Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim(),
            CreatedAt = utcNow,
            UpdatedAt = utcNow
        };

        _db.TodoItems.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return entity.ToResponse();
    }
}
