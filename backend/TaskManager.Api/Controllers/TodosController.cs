using MediatR;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Domain.Constants;
using TaskManager.Api.Features.Todos.Commands;
using TaskManager.Api.Features.Todos.DTOs;
using TaskManager.Api.Features.Todos.Queries;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TodosController : ControllerBase
{
    private readonly IMediator _mediator;

    public TodosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>List todos with optional filters, sorting, and pagination.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<TodoResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<TodoResponse>>> GetTodos(
        [FromQuery] GetTodosQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>Aggregated counts for dashboard.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(TodoSummaryResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TodoSummaryResponse>> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTodoSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get a single todo by id.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTodoByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Create a new todo.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TodoResponse>> Create(
        [FromBody] CreateTodoRequest body,
        CancellationToken cancellationToken)
    {
        var command = new CreateTodoCommand(
            body.Title,
            body.Description,
            body.Priority,
            body.DueDate,
            body.Category);
        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Replace an existing todo.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoResponse>> Update(
        Guid id,
        [FromBody] UpdateTodoRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpdateTodoCommand(
            id,
            body.Title,
            body.Description,
            body.IsCompleted,
            body.Priority,
            body.DueDate,
            body.Category);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Delete a todo.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteTodoCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Returns the fixed list of valid category values.</summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public IActionResult GetCategories() => Ok(TodoCategories.All);

    /// <summary>Toggle completion status.</summary>
    [HttpPatch("{id:guid}/toggle")]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoResponse>> Toggle(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ToggleTodoCommand(id), cancellationToken);
        return Ok(result);
    }
}
