using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;

namespace Chronoughts.Api.Services;

public interface IThoughtConnectionService
{
    Task<ThoughtConnectionResponse> CreateConnectionAsync(ThoughtConnectionRequest request, CancellationToken cancellationToken = default);
    Task<ThoughtConnectionResponse?> GetConnectionAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnectionResponse>> GetConnectionsByThoughtAsync(Guid thoughtId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnectionResponse>> GetOutgoingConnectionsAsync(Guid thoughtId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtConnectionResponse>> GetIncomingConnectionsAsync(Guid thoughtId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ThoughtResponse>> GetRelatedThoughtsAsync(Guid thoughtId, int maxDepth = 1, CancellationToken cancellationToken = default);
    Task<ThoughtConnectionResponse> UpdateConnectionAsync(Guid id, ThoughtConnectionRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteConnectionAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ConnectionExistsAsync(Guid sourceId, Guid targetId, CancellationToken cancellationToken = default);
}