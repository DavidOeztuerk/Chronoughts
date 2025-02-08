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
}
