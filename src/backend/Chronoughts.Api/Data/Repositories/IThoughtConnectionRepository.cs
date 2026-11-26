using Chronoughts.Api.Models;

namespace Chronoughts.Api.Data.Repositories;

public interface IThoughtConnectionRepository
{
    Task<ThoughtConnection> AddAsync(ThoughtConnection entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnection>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ThoughtConnection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ThoughtConnection> UpdateAsync(ThoughtConnection entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnection>> GetByThoughtIdAsync(Guid thoughtId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnection>> GetOutgoingConnectionsAsync(Guid sourceThoughtId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnection>> GetIncomingConnectionsAsync(Guid targetThoughtId, CancellationToken cancellationToken = default);
    Task<ThoughtConnection?> GetConnectionBetweenAsync(Guid thought1Id, Guid thought2Id, CancellationToken cancellationToken = default);
    Task<bool> ConnectionExistsAsync(Guid sourceId, Guid targetId, ConnectionType type, CancellationToken cancellationToken = default);
    Task<IEnumerable<Thought>> GetRelatedThoughtsAsync(Guid thoughtId, int maxDepth = 1, CancellationToken cancellationToken = default);
}