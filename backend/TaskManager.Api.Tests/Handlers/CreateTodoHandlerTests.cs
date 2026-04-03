using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.Commands;

namespace TaskManager.Api.Tests.Handlers;

[TestFixture]
public sealed class CreateTodoHandlerTests
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
    public async Task Handle_PersistsTodo_AndReturnsResponse()
    {
        await using var db = new AppDbContext(_options);
        var handler = new CreateTodoHandler(db);
        var command = new CreateTodoCommand(
            "Test title",
            "Desc",
            Priority.High,
            DateTime.UtcNow.AddDays(1),
            "Work");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Multiple(() =>
        {
            Assert.That(result.Title, Is.EqualTo("Test title"));
            Assert.That(result.Priority, Is.EqualTo(Priority.High));
            Assert.That(result.IsCompleted, Is.False);
        });
        Assert.That(await db.TodoItems.CountAsync(), Is.EqualTo(1));
    }
}
