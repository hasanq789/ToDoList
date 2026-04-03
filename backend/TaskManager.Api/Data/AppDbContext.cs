using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Domain.Entities;

namespace TaskManager.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TodoItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.Category).HasMaxLength(100);
            e.HasIndex(x => x.IsCompleted);
            e.HasIndex(x => x.Priority);
            e.HasIndex(x => x.DueDate);
        });
    }
}
