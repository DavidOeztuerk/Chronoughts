using System.Linq.Expressions;
using Chronoughts.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Chronoughts.Api.Data.Repositories;

public class ThoughtRepository<T>(
    ChronoughtsDbContext context)
    : IThoughtRepository<T>
    where T : Thought
{
    protected readonly ChronoughtsDbContext _context = context;
    protected readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync([id], cancellationToken: cancellationToken);
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        await Task.Run(() =>
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }, cancellationToken);
    }

    public async Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        await Task.Run(() =>
        {
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
        }, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<T>> GetByTagAsync(string tag, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.Tags.Contains(tag))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<T>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
           .Where(t => t.Category == category)
           .ToListAsync(cancellationToken);
    }
}
