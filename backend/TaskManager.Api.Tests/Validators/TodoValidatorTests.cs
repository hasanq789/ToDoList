using FluentValidation.TestHelper;
using TaskManager.Api.Domain.Enums;
using TaskManager.Api.Features.Todos.Commands;

namespace TaskManager.Api.Tests.Validators;

[TestFixture]
public sealed class TodoValidatorTests
{
    private CreateTodoValidator _validator = null!;

    [SetUp]
    public void SetUp()
    {
        _validator = new CreateTodoValidator();
    }

    [Test]
    public void CreateTodo_EmptyTitle_HasValidationError()
    {
        var cmd = new CreateTodoCommand("", null, Priority.Low, null, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Test]
    public void CreateTodo_ValidCategory_PassesValidation()
    {
        var cmd = new CreateTodoCommand("Task", null, Priority.Low, null, "Work");
        var result = _validator.TestValidate(cmd);
        result.ShouldNotHaveValidationErrorFor(x => x.Category);
    }

    [Test]
    public void CreateTodo_NullCategory_PassesValidation()
    {
        var cmd = new CreateTodoCommand("Task", null, Priority.Low, null, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldNotHaveValidationErrorFor(x => x.Category);
    }

    [Test]
    public void CreateTodo_InvalidCategory_HasValidationError()
    {
        var cmd = new CreateTodoCommand("Task", null, Priority.Low, null, "InvalidCategory");
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Category);
    }

    [Test]
    public void CreateTodo_TitleTooLong_HasValidationError()
    {
        var cmd = new CreateTodoCommand(new string('a', 201), null, Priority.Low, null, null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }
}
