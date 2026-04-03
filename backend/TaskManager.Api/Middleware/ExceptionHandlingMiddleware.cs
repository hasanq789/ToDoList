using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.Exceptions;

namespace TaskManager.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var status = HttpStatusCode.InternalServerError;
        string title = "An unexpected error occurred.";
        IDictionary<string, string[]>? errors = null;

        switch (exception)
        {
            case ValidationException vex:
                status = HttpStatusCode.BadRequest;
                title = "Validation failed.";
                errors = vex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                break;
            case TodoNotFoundException:
                status = HttpStatusCode.NotFound;
                title = exception.Message;
                break;
            default:
                _logger.LogError(exception, "Unhandled exception");
                break;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)status;

        var problem = new ProblemDetails
        {
            Status = context.Response.StatusCode,
            Title = title,
            Detail = errors is null ? exception.Message : null,
            Instance = context.Request.Path
        };

        if (errors is not null)
        {
            problem.Extensions["errors"] = errors;
        }

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, JsonOptions));
    }
}
