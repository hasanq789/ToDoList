using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManager.Api.Controllers;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.Commands;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Queries;

namespace TaskManager.Api.Tests.Controllers;

[TestFixture]
public sealed class TodosControllerTests
{
    [Test]
    public async Task GetById_ReturnsOk_WithMediatorResult()
    {
        var id = Guid.NewGuid();
        var response = new TodoResponse(
            id,
            "Title",
            null,
            false,
            Priority.Medium,
            null,
            null,
            DateTime.UtcNow,
            DateTime.UtcNow,
            false);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(m => m.Send(It.Is<GetTodoByIdQuery>(q => q.Id == id), It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        var controller = new TodosController(mediator.Object);
        var result = await controller.GetById(id, CancellationToken.None);

        Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(response));
    }

    [Test]
    public async Task Create_ReturnsCreatedAtRoute()
    {
        var id = Guid.NewGuid();
        var created = new TodoResponse(
            id,
            "New",
            null,
            false,
            Priority.Low,
            null,
            null,
            DateTime.UtcNow,
            DateTime.UtcNow,
            false);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(m => m.Send(It.IsAny<CreateTodoCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(created);

        var controller = new TodosController(mediator.Object);
        var body = new CreateTodoRequest("New", null, Priority.Low, null, null);
        var result = await controller.Create(body, CancellationToken.None);

        Assert.That(result.Result, Is.InstanceOf<CreatedAtActionResult>());
        var createdResult = (CreatedAtActionResult)result.Result!;
        Assert.That(createdResult.Value, Is.EqualTo(created));
        Assert.That(createdResult.RouteValues!["id"], Is.EqualTo(id));
    }

    [Test]
    public async Task Delete_ReturnsNoContent()
    {
        var id = Guid.NewGuid();
        var mediator = new Mock<IMediator>();
        mediator
            .Setup(m => m.Send(It.IsAny<DeleteTodoCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var controller = new TodosController(mediator.Object);
        var result = await controller.Delete(id, CancellationToken.None);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
    }
}
