# Task Manager

A production-grade to-do task management application built with **.NET 9 Web API** (backend) and **React + TypeScript** (frontend).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Architectural Decisions](#architectural-decisions)
- [Assumptions](#assumptions)
- [Trade-offs](#trade-offs)
- [Scalability Considerations](#scalability-considerations)
- [Future Enhancements](#future-enhancements)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  React Frontend  (Vite + TypeScript + Tailwind CSS)          │
│                                                              │
│  main.tsx → <ErrorBoundary> → <App>                          │
│    useTodos hook (state, optimistic updates, debounced API)  │
│    ├── <Header>          New Task button                     │
│    ├── <TodoStats>       Live counts + progress bar          │
│    ├── <TodoFiltersBar>  Quick due-filters + search/sort     │
│    ├── <TodoList>        Paginated item rows                 │
│    └── <TodoForm>        Modal create / edit                 │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / REST + JSON
┌──────────────────────────────▼───────────────────────────────┐
│  .NET 9 Web API  (Hybrid CQRS)                               │
│                                                              │
│  ExceptionHandlingMiddleware (RFC 7807 ProblemDetails)       │
│    → TodosController  (thin — only calls IMediator.Send)     │
│       MediatR pipeline:                                      │
│         LoggingBehavior  (structured timing per request)     │
│         ValidationBehavior  (FluentValidation auto-wiring)   │
│         → Command / Query Handler                            │
│            → EF Core InMemory DbContext                      │
└──────────────────────────────────────────────────────────────┘
```

**Request lifecycle:**
1. Every HTTP request passes through `ExceptionHandlingMiddleware` first.
2. The controller's only job is to map HTTP input to a MediatR command/query and return the result.
3. The MediatR pipeline runs `LoggingBehavior` (timing), then `ValidationBehavior` (auto-runs all FluentValidation validators). Handlers only execute with guaranteed-valid input.
4. Handlers interact with EF Core. Responses are always `TodoResponse` DTOs — the domain entity never leaks out.
5. Errors surface as RFC 7807 `application/problem+json` with field-level `errors` for validation failures.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend framework | ASP.NET Core Web API | .NET 9 |
| ORM / Database | EF Core — InMemory provider | 9.0 |
| Mediator / CQRS | MediatR | 12 |
| Validation | FluentValidation | 11 |
| Logging | Serilog (console sink) | 8 |
| API docs | Swashbuckle / Swagger UI | 7 |
| Frontend framework | React + TypeScript | 18 / 5 |
| Build tooling | Vite | 6 |
| Styling | Tailwind CSS | 3 |
| HTTP client | Axios | 1 |
| Backend tests | NUnit 4 + Moq + FluentValidation.TestHelper | 4 |
| Frontend tests | Vitest + React Testing Library | 2 / 16 |

---

## Project Structure

```
FunctionHealth/
├── backend/
│   ├── TaskManager.sln
│   ├── TaskManager.Api/
│   │   ├── Behaviors/
│   │   │   ├── LoggingBehavior.cs       # MediatR pipeline: structured timing
│   │   │   └── ValidationBehavior.cs    # MediatR pipeline: auto FluentValidation
│   │   ├── Controllers/
│   │   │   └── TodosController.cs       # Thin HTTP layer — dispatches only
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs          # EF Core config + constraints
│   │   │   └── DbSeeder.cs             # Demo seed data
│   │   ├── Domain/
│   │   │   ├── Constants/
│   │   │   │   └── TodoCategories.cs   # Canonical category list
│   │   │   ├── Entities/
│   │   │   │   └── TodoItem.cs
│   │   │   └── Enums/
│   │   │       ├── DueFilter.cs        # Today | ThisWeek
│   │   │       └── Priority.cs         # Low | Medium | High | Critical
│   │   ├── Exceptions/
│   │   │   └── TodoNotFoundException.cs
│   │   ├── Features/Todos/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateTodo.cs       # Command + Handler + Validator
│   │   │   │   ├── UpdateTodo.cs
│   │   │   │   ├── DeleteTodo.cs
│   │   │   │   └── ToggleTodo.cs
│   │   │   ├── Queries/
│   │   │   │   ├── GetTodos.cs         # Query + Handler + Validator
│   │   │   │   ├── GetTodoById.cs
│   │   │   │   └── GetTodoSummary.cs
│   │   │   ├── DTOs/                   # Request / Response shapes
│   │   │   └── Mapping/
│   │   │       └── TodoMappings.cs     # Entity → DTO (IsOverdue calc)
│   │   ├── Middleware/
│   │   │   └── ExceptionHandlingMiddleware.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── TaskManager.Api.Tests/
│       ├── Controllers/
│       │   └── TodosControllerTests.cs  # Mocked IMediator, HTTP status codes
│       ├── Handlers/
│       │   ├── CreateTodoHandlerTests.cs
│       │   ├── GetTodosHandlerTests.cs  # Search, Priority, Category, DueFilter
│       │   └── ToggleTodoHandlerTests.cs
│       └── Validators/
│           └── TodoValidatorTests.cs    # FluentValidation category rules
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts                   # Dev proxy → :5146, Vitest config
    ├── tailwind.config.js
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── Badge.tsx            # PriorityBadge, CategoryBadge, OverdueBadge
        │   │   ├── ConfirmDialog.tsx
        │   │   ├── EmptyState.tsx
        │   │   ├── ErrorBoundary.tsx    # React class-based error boundary
        │   │   └── Spinner.tsx
        │   ├── Layout/
        │   │   └── Header.tsx
        │   ├── TodoForm/
        │   │   └── TodoForm.tsx         # Create/edit modal with client validation
        │   ├── TodoList/
        │   │   ├── TodoFilters.tsx      # Due Today/This Week pills + dropdowns
        │   │   ├── TodoItem.tsx         # Single row with optimistic toggle
        │   │   └── TodoList.tsx         # List + skeleton + pagination
        │   └── TodoStats/
        │       └── TodoStats.tsx        # Stats cards + completion progress bar
        ├── hooks/
        │   ├── useDebounce.ts
        │   └── useTodos.ts              # Central state: fetch, mutate, optimistic UI
        ├── services/
        │   └── api.ts                   # Axios client + error interceptor
        ├── test/
        │   ├── useDebounce.test.ts
        │   ├── TodoForm.test.tsx
        │   └── TodoItem.test.tsx
        └── types/
            └── todo.ts                  # Types, enums, CATEGORY_COLORS, defaults
```

---

## Features

### Core Task Management
- ✅ Create, read, update, delete tasks
- ✅ Toggle task completion (with optimistic UI update)
- ✅ Task priority levels: **Low**, **Medium**, **High**, **Critical** — colour-coded
- ✅ Due dates with **Overdue** indicator for past-due items
- ✅ Task descriptions (optional, up to 2 000 characters)

### Categories
- ✅ Predefined category enum: Work, Personal, Career, Health, Finance, Learning, Home, Shopping, Other
- ✅ Each category renders with a distinct colour badge
- ✅ Category validated server-side against the canonical list

### Filtering & Search
- ✅ **Due Today** and **Due This Week** quick-filter toggle pills (cleared by clicking again)
- ✅ Full-text search across title and description (debounced 350 ms)
- ✅ Filter by priority, completion status, and category
- ✅ Configurable sort: Created, Updated, Due Date, Priority, Title — ascending or descending

### UX & Production Patterns
- ✅ Server-side pagination (configurable page size, up to 100)
- ✅ Dashboard stats: total, completed, pending, overdue, counts by priority, completion progress bar
- ✅ Skeleton loading state on initial load; spinner on subsequent fetches
- ✅ Optimistic toggle with automatic rollback on API failure
- ✅ Client-side validation before any API call; server validation errors displayed inline
- ✅ Global error banner for network/API failures
- ✅ React `ErrorBoundary` catches unexpected render errors gracefully
- ✅ `ConfirmDialog` before destructive delete actions
- ✅ Empty state with contextual CTA (differs for "no tasks" vs "no filter results")
- ✅ Fully accessible: ARIA labels, roles, `sr-only` labels on all filter controls

### API & Backend
- ✅ RFC 7807 `application/problem+json` error responses with field-level errors
- ✅ Structured request logging via Serilog with elapsed ms per request
- ✅ Swagger UI always available at `/swagger` for instant API exploration
- ✅ Health check endpoint at `/health` for load balancer probes

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| .NET SDK | **9.0** | `dotnet --version` |
| Node.js | **20 LTS** | `node --version` |
| npm | **9+** | `npm --version` |

---

## Quick Start

### 1 — Start the backend

```bash
cd backend/TaskManager.Api
dotnet run
```

- API: **http://localhost:5146**
- Swagger UI: **http://localhost:5146/swagger**
- Health check: **http://localhost:5146/health**

The in-memory database is seeded with 3 example tasks on first run. Data resets on each server restart (by design — see [Assumptions](#assumptions)).

### 2 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

- App: **http://localhost:5173**

The Vite dev server proxies all `/api/*` requests to `http://localhost:5146`, so **no CORS or environment configuration is required**. Both servers must be running simultaneously.

### Build for production

```bash
# Backend
cd backend/TaskManager.Api
dotnet publish -c Release -o ./publish

# Frontend
cd frontend
npm run build
# Output: frontend/dist/
```

---

## API Reference

> Full interactive documentation is available at **http://localhost:5146/swagger** once the API is running.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/todos` | List todos — filterable, sortable, paginated |
| `GET` | `/api/todos/{id}` | Get a single todo by GUID |
| `GET` | `/api/todos/summary` | Aggregated counts (total, completed, pending, overdue, by priority) |
| `GET` | `/api/todos/categories` | Returns the canonical category list |
| `POST` | `/api/todos` | Create a new todo |
| `PUT` | `/api/todos/{id}` | Full update of an existing todo |
| `PATCH` | `/api/todos/{id}/toggle` | Toggle completion status |
| `DELETE` | `/api/todos/{id}` | Delete a todo |
| `GET` | `/health` | Health check (returns 200 Healthy) |

### GET /api/todos — Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Full-text search on title and description |
| `priority` | `Low\|Medium\|High\|Critical` | — | Filter by priority level |
| `isCompleted` | bool | — | `true` = completed only, `false` = pending only |
| `category` | string | — | Exact match against a valid category name |
| `due` | `Today\|ThisWeek` | — | Filter by due date window |
| `sortBy` | string | `createdAt` | `createdAt`, `updatedAt`, `dueDate`, `priority`, `title` |
| `sortDirection` | `asc\|desc` | `desc` | Sort order |
| `page` | int | `1` | 1-indexed page number |
| `pageSize` | int | `10` | Items per page (max 100) |

### POST / PUT — Request Body

```json
{
  "title": "Review architecture document",
  "description": "CQRS + MediatR patterns",
  "priority": "High",
  "dueDate": "2026-04-10T00:00:00Z",
  "category": "Work"
}
```

`PUT` additionally requires `"isCompleted": true|false`.

### Error Responses

All errors follow **RFC 7807** `application/problem+json`:

```json
{
  "status": 400,
  "title": "Validation failed.",
  "instance": "/api/todos",
  "errors": {
    "Title": ["'Title' must not be empty."],
    "Category": ["Category must be one of: Work, Personal, Career, ..."]
  }
}
```

404 responses include a human-readable `title` identifying the missing resource.

---

## Running Tests

### Backend — 16 NUnit tests

```bash
cd backend
dotnet test
```

Test coverage:

| Suite | Tests | What is covered |
|-------|-------|-----------------|
| `CreateTodoHandlerTests` | 1 | Persistence, response shape |
| `GetTodosHandlerTests` | 5 | Search, priority filter, category filter, Due Today, Due This Week |
| `ToggleTodoHandlerTests` | 2 | Toggle logic, not-found exception |
| `TodoValidatorTests` | 5 | Empty title, max-length, valid/null/invalid category |
| `TodosControllerTests` | 3 | HTTP status codes with mocked `IMediator` |

### Frontend — 16 Vitest tests

```bash
cd frontend
npm test
```

Test coverage:

| Suite | Tests | What is covered |
|-------|-------|-----------------|
| `TodoItem.test.tsx` | 7 | Title render, priority badge, toggle callback, completed state, overdue badge, CategoryBadge colour, no badge when null |
| `TodoForm.test.tsx` | 6 | Empty state, validation error, submit payload, cancel, edit population, category select options |
| `useDebounce.test.ts` | 3 | Initial value, delay before update, value after delay elapses |

---

## Architectural Decisions

### Hybrid CQRS with MediatR

I chose **lightweight CQRS** over a plain service layer. Each operation lives in a single self-contained file: the MediatR command/query record, its handler, and its validator colocated together. This makes the intent of any operation immediately obvious without jumping between files.

I deliberately avoided full event-sourcing CQRS — for a single aggregate like `TodoItem` that would be over-engineering. The sweet spot here is: **explicit intent separation + MediatR pipeline for cross-cutting concerns**.

### MediatR Pipeline Behaviors

Two generic pipeline behaviors handle cross-cutting concerns globally, so **handlers never need to import validators or write logging code**:

- `LoggingBehavior<TRequest, TResponse>` — logs the request name and elapsed milliseconds for every command/query
- `ValidationBehavior<TRequest, TResponse>` — auto-discovers and runs all registered FluentValidation validators; throws before the handler executes if any rule fails

### Feature-Folder Organisation

Files are colocated by feature, not by technical layer. `CreateTodo.cs` contains the command record, handler, and validator in one file. This scales significantly better than the traditional `Controllers/` → `Services/` → `Validators/` split: adding a new feature means touching one folder, not four.

### EF Core InMemory

Used as specified by the test brief. The `AppDbContext` is configured with the same constraints (max lengths, indexes, entity configuration) as a production schema — the only change for a real database would be swapping the provider and running `dotnet ef migrations add`.

### Optimistic UI for Toggle

Toggling completion applies the state change **locally first**, immediately reflects in the UI, then confirms with the API. If the API call fails, the state reverts and an error banner appears. This is the standard production pattern for perceived performance on high-frequency interactions.

### Category as a Controlled Enum

Categories are stored as strings (more flexible for future migration) but constrained to a canonical list (`TodoCategories.All`) validated by FluentValidation on both create and update. The frontend renders each category with a distinct Tailwind colour via the `CATEGORY_COLORS` lookup — no magic strings, all type-safe via the `Category` union type.

---

## Assumptions

- **Authentication is out of scope** — tasks are not user-scoped; first production step is JWT bearer auth
- **All timestamps are UTC** — the frontend formats them into the user's locale for display
- **The InMemory database resets on server restart** — this is intentional and expected for a demo; production would use PostgreSQL with migrations
- **Category is a controlled list** — not a free-form tag; the list is defined in `TodoCategories.cs` and is the single source of truth for both backend validation and frontend dropdowns
- **The `due` filter uses `>=today` for "This Week"** — overdue items are excluded from the "Due This Week" view (they have their own visual treatment via the Overdue badge)

---

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| MediatR over plain service layer | ~30% more boilerplate per feature; worthwhile for testability, pipeline extensibility, and explicit intent |
| EF Core InMemory | Zero-setup but no SQL semantics (no real transactions, no FK constraint enforcement at DB level) — acceptable for a demo |
| No authentication | Simplifies the demo scope; production would add JWT bearer in `Program.cs` with minimal code changes |
| Tailwind CSS | More verbose JSX classnames vs. CSS modules, but dramatically faster to iterate and co-locates styles with markup |
| Single `useTodos` hook | All state in one place is clean at this scale; at larger scale split into `useFilters`, `useTodoMutations`, and `useTodoQuery` |
| Controlled categories vs. free-form tags | Loses flexibility but gains type safety, consistent badge colours, and server-side validation integrity |

---

## Scalability Considerations

### Database
- Replace EF Core InMemory with **PostgreSQL** (`Npgsql.EntityFrameworkCore.PostgreSQL`) — zero `AppDbContext` changes needed, only swap the provider
- Add EF Core migrations (`dotnet ef migrations add Initial`)
- Add composite indexes for the most common query patterns (already modelled in `OnModelCreating`)

### Authentication & Authorisation
- Add **JWT bearer authentication** via `Microsoft.AspNetCore.Authentication.JwtBearer`
- Add `UserId` foreign key to `TodoItem` and scope all queries to the authenticated user
- Role-based access control if multi-tenant (admin vs. regular user)

### Caching
- Add **Redis** response caching for `GetTodosQuery` — invalidate on any write command via MediatR `INotificationHandler`
- HTTP `ETag` / `If-None-Match` for conditional requests

### Rate Limiting
- .NET 9 built-in rate limiting middleware (`AddRateLimiter`) — already available, requires one `app.UseRateLimiter()` call
- Apply a stricter policy to write endpoints (POST/PUT/DELETE)

### Observability
- OpenTelemetry traces → Jaeger / Azure Monitor / Grafana Tempo
- Serilog already in place — switch console sink to **Seq** or **Application Insights** sink via config only
- Structured `correlation-id` propagation across distributed services

### Deployment
- **Dockerise** both services (`Dockerfile` per project + `docker-compose.yml`)
- **GitHub Actions** CI: `dotnet test` + `npm test` + Docker build on PR, Docker push on merge to main
- Kubernetes deployment with horizontal pod autoscaling on CPU/memory

### Frontend State
- At current scale `useTodos` is sufficient
- For multi-page apps consider **TanStack Query** (React Query) — server-state caching, background refetching, and optimistic updates as first-class primitives, replacing the hand-rolled `useTodos` hook

---

## Future Enhancements

- **User authentication** — Google OAuth / JWT login; tasks become user-scoped
- **Task assignments** — assign tasks to team members (requires user model)
- **Recurring tasks** — cron-style recurrence rules with next-due-date computation
- **File attachments** — upload supporting documents (S3 / Azure Blob)
- **Email / push notifications** — reminders for upcoming and overdue tasks
- **Kanban board view** — drag-and-drop column layout alongside the list view
- **Dark mode** — Tailwind `dark:` variant support is already in the config
- **Audit log** — track every field change with timestamp and actor (EF Core shadow properties)
- **Bulk operations** — complete or delete multiple tasks at once
- **CSV / PDF export** — reporting for teams and managers
- **Real-time updates** — SignalR hub to push changes to all connected clients instantly
