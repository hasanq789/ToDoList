namespace TaskManager.Api.Exceptions;

public sealed class TodoNotFoundException(Guid id) : Exception($"Todo with id '{id}' was not found.")
{
    public Guid TodoId { get; } = id;
}
