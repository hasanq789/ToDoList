using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Entities;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Exceptions;
using TaskManager.Api.Features.Todos.Commands;

namespace TaskManager.Api.Tests.Handlers;

[TestFixture]
public sealed class ToggleTodoHandlerTests
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
    public async Task Handle_TogglesCompletion()
    {
        var id = Guid.NewGuid();
        await using (var db = new AppDbContext(_options))
        {
            var now = DateTime.UtcNow;
            db.TodoItems.Add(new TodoItem
            {
                Id = id,
                Title = "T",
                IsCompleted = false,
                Priority = Priority.Medium,
                CreatedAt = now,
                UpdatedAt = now
            });
            await db.SaveChangesAsync();
        }

        await using (var db = new AppDbContext(_options))
        {
            var handler = new ToggleTodoHandler(db);
            var result = await handler.Handle(new ToggleTodoCommand(id), CancellationToken.None);
            Assert.That(result.IsCompleted, Is.True);
        }

        await using (var db = new AppDbContext(_options))
        {
            var entity = await db.TodoItems.SingleAsync();
            Assert.That(entity.IsCompleted, Is.True);
        }
    }

    [Test]
    public async Task Handle_UnknownId_ThrowsTodoNotFoundException()
    {
        await using var db = new AppDbContext(_options);
        var handler = new ToggleTodoHandler(db);

        try
        {
            await handler.Handle(new ToggleTodoCommand(Guid.NewGuid()), CancellationToken.None);
            Assert.Fail("Expected TodoNotFoundException");
        }
        catch (TodoNotFoundException)
        {
            // expected
        }
    }
}
