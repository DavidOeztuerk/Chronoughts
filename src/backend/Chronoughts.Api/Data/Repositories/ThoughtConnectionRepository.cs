using Chronoughts.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Chronoughts.Api.Data.Repositories;

public class ThoughtConnectionRepository(ChronoughtsDbContext context) : IThoughtConnectionRepository
{
    private readonly ChronoughtsDbContext _context = context;

    public async Task<ThoughtConnection> AddAsync(ThoughtConnection entity, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(entity);
        
        // Validierung: Keine Selbstreferenz
        if (entity.SourceThoughtId == entity.TargetThoughtId)
        {
            throw new InvalidOperationException("A thought cannot be connected to itself");
        }
        
        // Validierung: Beide Thoughts müssen existieren
        var sourceExists = await _context.Thoughts.AnyAsync(t => t.Id == entity.SourceThoughtId, cancellationToken);
        var targetExists = await _context.Thoughts.AnyAsync(t => t.Id == entity.TargetThoughtId, cancellationToken);
        
        if (!sourceExists || !targetExists)
        {
            throw new InvalidOperationException("Both source and target thoughts must exist");
        }
        
        // Validierung: Keine doppelten Verbindungen
        var existingConnection = await ConnectionExistsAsync(
            entity.SourceThoughtId, 
            entity.TargetThoughtId, 
            entity.ConnectionType, 
            cancellationToken);
            
        if (existingConnection)
        {
            throw new InvalidOperationException($"A {entity.ConnectionType} connection already exists between these thoughts");
        }
        
        entity.Id = Guid.NewGuid();
        entity.CreatedAt = DateTime.UtcNow;
        
        await _context.ThoughtConnections.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        
        return entity;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ThoughtConnections.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null) return false;
        
        _context.ThoughtConnections.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        
        return true;
    }

    public async Task<IEnumerable<ThoughtConnection>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .Include(tc => tc.SourceThought)
            .Include(tc => tc.TargetThought)
            .ToListAsync(cancellationToken);
    }

    public async Task<ThoughtConnection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .Include(tc => tc.SourceThought)
            .Include(tc => tc.TargetThought)
            .FirstOrDefaultAsync(tc => tc.Id == id, cancellationToken);
    }

    public async Task<ThoughtConnection> UpdateAsync(ThoughtConnection entity, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(entity);
        
        var existing = await _context.ThoughtConnections.FindAsync(new object[] { entity.Id }, cancellationToken);
        if (existing == null)
        {
            throw new InvalidOperationException($"ThoughtConnection with id {entity.Id} not found");
        }
        
        existing.ConnectionType = entity.ConnectionType;
        existing.Description = entity.Description;
        existing.Strength = entity.Strength;
        
        await _context.SaveChangesAsync(cancellationToken);
        
        return existing;
    }

    public async Task<IEnumerable<ThoughtConnection>> GetByThoughtIdAsync(Guid thoughtId, CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .Include(tc => tc.SourceThought)
            .Include(tc => tc.TargetThought)
            .Where(tc => tc.SourceThoughtId == thoughtId || tc.TargetThoughtId == thoughtId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ThoughtConnection>> GetOutgoingConnectionsAsync(Guid sourceThoughtId, CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .Include(tc => tc.TargetThought)
            .Where(tc => tc.SourceThoughtId == sourceThoughtId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ThoughtConnection>> GetIncomingConnectionsAsync(Guid targetThoughtId, CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .Include(tc => tc.SourceThought)
            .Where(tc => tc.TargetThoughtId == targetThoughtId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ThoughtConnection?> GetConnectionBetweenAsync(Guid thought1Id, Guid thought2Id, CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .Include(tc => tc.SourceThought)
            .Include(tc => tc.TargetThought)
            .FirstOrDefaultAsync(tc => 
                (tc.SourceThoughtId == thought1Id && tc.TargetThoughtId == thought2Id) ||
                (tc.SourceThoughtId == thought2Id && tc.TargetThoughtId == thought1Id),
                cancellationToken);
    }

    public async Task<bool> ConnectionExistsAsync(Guid sourceId, Guid targetId, ConnectionType type, CancellationToken cancellationToken = default)
    {
        return await _context.ThoughtConnections
            .AnyAsync(tc => 
                tc.SourceThoughtId == sourceId && 
                tc.TargetThoughtId == targetId && 
                tc.ConnectionType == type,
                cancellationToken);
    }

    public async Task<IEnumerable<Thought>> GetRelatedThoughtsAsync(Guid thoughtId, int maxDepth = 1, CancellationToken cancellationToken = default)
    {
        var relatedThoughts = new HashSet<Thought>();
        var processedIds = new HashSet<Guid>();
        var queue = new Queue<(Guid id, int depth)>();
        
        queue.Enqueue((thoughtId, 0));
        
        while (queue.Count > 0)
        {
            var (currentId, currentDepth) = queue.Dequeue();
            
            if (processedIds.Contains(currentId) || currentDepth > maxDepth)
                continue;
                
            processedIds.Add(currentId);
            
            // Outgoing connections
            var outgoing = await _context.ThoughtConnections
                .Include(tc => tc.TargetThought)
                .Where(tc => tc.SourceThoughtId == currentId)
                .ToListAsync(cancellationToken);
                
            foreach (var conn in outgoing)
            {
                if (conn.TargetThought != null && !relatedThoughts.Contains(conn.TargetThought))
                {
                    relatedThoughts.Add(conn.TargetThought);
                    if (currentDepth < maxDepth)
                    {
                        queue.Enqueue((conn.TargetThoughtId, currentDepth + 1));
                    }
                }
            }
            
            // Incoming connections
            var incoming = await _context.ThoughtConnections
                .Include(tc => tc.SourceThought)
                .Where(tc => tc.TargetThoughtId == currentId)
                .ToListAsync(cancellationToken);
                
            foreach (var conn in incoming)
            {
                if (conn.SourceThought != null && !relatedThoughts.Contains(conn.SourceThought))
                {
                    relatedThoughts.Add(conn.SourceThought);
                    if (currentDepth < maxDepth)
                    {
                        queue.Enqueue((conn.SourceThoughtId, currentDepth + 1));
                    }
                }
            }
        }
        
        return relatedThoughts;
    }
}