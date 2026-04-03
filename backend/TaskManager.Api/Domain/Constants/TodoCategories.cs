namespace TaskManager.Api.Domain.Constants;

public static class TodoCategories
{
    public static readonly IReadOnlyList<string> All = new[]
    {
        "Work", "Personal", "Career", "Health", "Finance", "Learning", "Home", "Shopping", "Other"
    };
}
