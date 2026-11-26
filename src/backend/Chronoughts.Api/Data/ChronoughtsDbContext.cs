using System;
using Chronoughts.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Chronoughts.Api.Data;

public class ChronoughtsDbContext(
    DbContextOptions<ChronoughtsDbContext> options)
    : DbContext(options)
{
    public DbSet<Thought> Thoughts => this.Set<Thought>();
    public DbSet<User> Users => this.Set<User>();
    public DbSet<Role> Roles => this.Set<Role>();
    public DbSet<ThoughtConnection> ThoughtConnections => this.Set<ThoughtConnection>();
    public DbSet<ThoughtTask> ThoughtTasks => this.Set<ThoughtTask>();
    public DbSet<Tag> Tags => this.Set<Tag>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ThoughtConnection Konfiguration
        modelBuilder.Entity<ThoughtConnection>()
            .HasOne(tc => tc.SourceThought)
            .WithMany(t => t.OutgoingConnections)
            .HasForeignKey(tc => tc.SourceThoughtId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<ThoughtConnection>()
            .HasOne(tc => tc.TargetThought)
            .WithMany(t => t.IncomingConnections)
            .HasForeignKey(tc => tc.TargetThoughtId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // ThoughtTask Konfiguration
        modelBuilder.Entity<ThoughtTask>()
            .HasOne(tt => tt.Thought)
            .WithMany(t => t.Tasks)
            .HasForeignKey(tt => tt.ThoughtId);
            
        modelBuilder.Entity<ThoughtTask>()
            .HasOne(tt => tt.ParentTask)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(tt => tt.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // ThoughtTag Many-to-Many Konfiguration
        modelBuilder.Entity<ThoughtTag>()
            .HasKey(tt => new { tt.ThoughtId, tt.TagId });
            
        modelBuilder.Entity<ThoughtTag>()
            .HasOne(tt => tt.Thought)
            .WithMany(t => t.ThoughtTags)
            .HasForeignKey(tt => tt.ThoughtId);
            
        modelBuilder.Entity<ThoughtTag>()
            .HasOne(tt => tt.Tag)
            .WithMany(t => t.ThoughtTags)
            .HasForeignKey(tt => tt.TagId);
        
        // Thought Versionierung
        modelBuilder.Entity<Thought>()
            .HasOne(t => t.PreviousVersion)
            .WithMany()
            .HasForeignKey(t => t.PreviousVersionId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // User-Role Many-to-Many Konfiguration
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });
            
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);
            
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);
            
        // User entity configuration
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
            
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
            
        // Seed default roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = Guid.NewGuid(), Name = "Admin", Description = "Administrator role with full access" },
            new Role { Id = Guid.NewGuid(), Name = "User", Description = "Standard user role" }
        );
    }
}
