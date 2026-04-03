using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Domain.Entities;
using TaskManager.Api.Domain.Enums;

namespace TaskManager.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.TodoItems.AnyAsync(cancellationToken))
            return;

        var now = DateTime.UtcNow;
        var items = new List<TodoItem>
        {
            new()
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Title = "Review architecture document",
                Description = "CQRS + MediatR patterns for the new service",
                IsCompleted = false,
                Priority = Priority.High,
                DueDate = now.AddDays(2),
                Category = "Work",
                CreatedAt = now.AddDays(-3),
                UpdatedAt = now.AddDays(-3)
            },
            new()
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Title = "Buy groceries",
                Description = "Milk, eggs, coffee",
                IsCompleted = true,
                Priority = Priority.Low,
                DueDate = now.AddDays(-1),
                Category = "Personal",
                CreatedAt = now.AddDays(-5),
                UpdatedAt = now.AddDays(-1)
            },
            new()
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Title = "Prepare take-home demo",
                IsCompleted = false,
                Priority = Priority.Critical,
                DueDate = now.Date,
                Category = "Career",
                CreatedAt = now.AddDays(-7),
                UpdatedAt = now.AddDays(-1)
            }
        };

        db.TodoItems.AddRange(items);
        await db.SaveChangesAsync(cancellationToken);
    }
}
