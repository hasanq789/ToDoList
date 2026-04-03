using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Entities;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.Queries;

namespace TaskManager.Api.Tests.Handlers;

[TestFixture]
public sealed class GetTodosHandlerTests
{
    private DbContextOptions<AppDbContext> _options = null!;

    [SetUp]
    public void SetUp()
    {
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }

    [Test]
    public async Task Handle_FiltersBySearch_AndPaginates()
    {
        await using var db = new AppDbContext(_options);
        var now = DateTime.UtcNow;
        db.TodoItems.AddRange(
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Alpha task",
                Description = "other",
                IsCompleted = false,
                Priority = Priority.Low,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Beta",
                Description = "contains Alpha in body",
                IsCompleted = true,
                Priority = Priority.Medium,
                CreatedAt = now,
                UpdatedAt = now
            });
        await db.SaveChangesAsync();

        var handler = new GetTodosHandler(db);
        var query = new GetTodosQuery("alpha", null, null, null, "title", "asc", 1, 10);

        var page = await handler.Handle(query, CancellationToken.None);

        Assert.That(page.TotalCount, Is.EqualTo(2));
        Assert.That(page.Items.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task Handle_FiltersByPriority()
    {
        await using var db = new AppDbContext(_options);
        var now = DateTime.UtcNow;
        db.TodoItems.AddRange(
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "A",
                IsCompleted = false,
                Priority = Priority.Critical,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "B",
                IsCompleted = false,
                Priority = Priority.Low,
                CreatedAt = now,
                UpdatedAt = now
            });
        await db.SaveChangesAsync();

        var handler = new GetTodosHandler(db);
        var query = new GetTodosQuery(null, Priority.Critical, null, null, null, null, 1, 10);

        var page = await handler.Handle(query, CancellationToken.None);

        Assert.That(page.TotalCount, Is.EqualTo(1));
        Assert.That(page.Items[0].Title, Is.EqualTo("A"));
    }

    [Test]
    public async Task Handle_DueFilter_Today_ReturnsOnlyTodayTasks()
    {
        await using var db = new AppDbContext(_options);
        var now = DateTime.UtcNow;
        db.TodoItems.AddRange(
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Due today",
                IsCompleted = false,
                Priority = Priority.Medium,
                DueDate = now.Date,
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Due tomorrow",
                IsCompleted = false,
                Priority = Priority.Medium,
                DueDate = now.Date.AddDays(1),
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "No due date",
                IsCompleted = false,
                Priority = Priority.Low,
                CreatedAt = now,
                UpdatedAt = now
            });
        await db.SaveChangesAsync();

        var handler = new GetTodosHandler(db);
        var query = new GetTodosQuery(null, null, null, null, null, null, 1, 10, DueFilter.Today);

        var page = await handler.Handle(query, CancellationToken.None);

        Assert.That(page.TotalCount, Is.EqualTo(1));
        Assert.That(page.Items[0].Title, Is.EqualTo("Due today"));
    }

    [Test]
    public async Task Handle_DueFilter_ThisWeek_ReturnsTasksDueWithinSevenDays()
    {
        await using var db = new AppDbContext(_options);
        var now = DateTime.UtcNow;
        db.TodoItems.AddRange(
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Due in 3 days",
                IsCompleted = false,
                Priority = Priority.Medium,
                DueDate = now.Date.AddDays(3),
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Due in 10 days",
                IsCompleted = false,
                Priority = Priority.Medium,
                DueDate = now.Date.AddDays(10),
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Overdue",
                IsCompleted = false,
                Priority = Priority.High,
                DueDate = now.Date.AddDays(-2),
                CreatedAt = now,
                UpdatedAt = now
            });
        await db.SaveChangesAsync();

        var handler = new GetTodosHandler(db);
        var query = new GetTodosQuery(null, null, null, null, null, null, 1, 10, DueFilter.ThisWeek);

        var page = await handler.Handle(query, CancellationToken.None);

        Assert.That(page.TotalCount, Is.EqualTo(1));
        Assert.That(page.Items[0].Title, Is.EqualTo("Due in 3 days"));
    }

    [Test]
    public async Task Handle_FiltersByCategory()
    {
        await using var db = new AppDbContext(_options);
        var now = DateTime.UtcNow;
        db.TodoItems.AddRange(
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Work task",
                IsCompleted = false,
                Priority = Priority.High,
                Category = "Work",
                CreatedAt = now,
                UpdatedAt = now
            },
            new TodoItem
            {
                Id = Guid.NewGuid(),
                Title = "Personal task",
                IsCompleted = false,
                Priority = Priority.Low,
                Category = "Personal",
                CreatedAt = now,
                UpdatedAt = now
            });
        await db.SaveChangesAsync();

        var handler = new GetTodosHandler(db);
        var query = new GetTodosQuery(null, null, null, "Work", null, null, 1, 10);

        var page = await handler.Handle(query, CancellationToken.None);

        Assert.That(page.TotalCount, Is.EqualTo(1));
        Assert.That(page.Items[0].Title, Is.EqualTo("Work task"));
    }
}
