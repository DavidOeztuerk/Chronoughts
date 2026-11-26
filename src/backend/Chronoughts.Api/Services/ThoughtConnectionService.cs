using AutoMapper;
using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Data.Repositories;
using Chronoughts.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace Chronoughts.Api.Services;

public class ThoughtConnectionService(
    IThoughtConnectionRepository connectionRepository,
    IThoughtRepository thoughtRepository,
    IMapper mapper) : IThoughtConnectionService
{
    private readonly IThoughtConnectionRepository _connectionRepository = connectionRepository;
    private readonly IThoughtRepository _thoughtRepository = thoughtRepository;
    private readonly IMapper _mapper = mapper;

    public async Task<ThoughtConnectionResponse> CreateConnectionAsync(ThoughtConnectionRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        
        // Validierung des Request-Objekts
        var validationContext = new ValidationContext(request);
        var validationResults = new List<ValidationResult>();
        
        if (!Validator.TryValidateObject(request, validationContext, validationResults, true))
        {
            var errors = string.Join("; ", validationResults.Select(r => r.ErrorMessage));
            throw new ValidationException($"Validation failed: {errors}");
        }
        
        // Zusätzliche Business-Validierung
        var sourceThought = await _thoughtRepository.GetByIdAsync(request.SourceThoughtId, cancellationToken);
        var targetThought = await _thoughtRepository.GetByIdAsync(request.TargetThoughtId, cancellationToken);
        
        if (sourceThought == null)
        {
            throw new ValidationException($"Source thought with ID {request.SourceThoughtId} not found");
        }
        
        if (targetThought == null)
        {
            throw new ValidationException($"Target thought with ID {request.TargetThoughtId} not found");
        }
        
        // Prüfen ob Verbindung bereits existiert
        var existingConnection = await _connectionRepository.ConnectionExistsAsync(
            request.SourceThoughtId,
            request.TargetThoughtId,
            request.ConnectionType,
            cancellationToken);
            
        if (existingConnection)
        {
            throw new ValidationException($"A {request.ConnectionType} connection already exists between these thoughts");
        }
        
        var connection = new ThoughtConnection
        {
            SourceThoughtId = request.SourceThoughtId,
            TargetThoughtId = request.TargetThoughtId,
            ConnectionType = request.ConnectionType,
            Description = request.Description,
            Strength = request.Strength
        };
        
        var created = await _connectionRepository.AddAsync(connection, cancellationToken);
        
        return new ThoughtConnectionResponse
        {
            Id = created.Id,
            SourceThoughtId = created.SourceThoughtId,
            TargetThoughtId = created.TargetThoughtId,
            SourceThoughtTitle = sourceThought.Title,
            TargetThoughtTitle = targetThought.Title,
            ConnectionType = created.ConnectionType,
            Description = created.Description,
            Strength = created.Strength,
            CreatedAt = created.CreatedAt
        };
    }

    public async Task<ThoughtConnectionResponse?> GetConnectionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var connection = await _connectionRepository.GetByIdAsync(id, cancellationToken);
        if (connection == null) return null;
        
        return new ThoughtConnectionResponse
        {
            Id = connection.Id,
            SourceThoughtId = connection.SourceThoughtId,
            TargetThoughtId = connection.TargetThoughtId,
            SourceThoughtTitle = connection.SourceThought?.Title,
            TargetThoughtTitle = connection.TargetThought?.Title,
            ConnectionType = connection.ConnectionType,
            Description = connection.Description,
            Strength = connection.Strength,
            CreatedAt = connection.CreatedAt
        };
    }

    public async Task<IEnumerable<ThoughtConnectionResponse>> GetConnectionsByThoughtAsync(Guid thoughtId, CancellationToken cancellationToken = default)
    {
        var connections = await _connectionRepository.GetByThoughtIdAsync(thoughtId, cancellationToken);
        
        return connections.Select(c => new ThoughtConnectionResponse
        {
            Id = c.Id,
            SourceThoughtId = c.SourceThoughtId,
            TargetThoughtId = c.TargetThoughtId,
            SourceThoughtTitle = c.SourceThought?.Title,
            TargetThoughtTitle = c.TargetThought?.Title,
            ConnectionType = c.ConnectionType,
            Description = c.Description,
            Strength = c.Strength,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<IEnumerable<ThoughtConnectionResponse>> GetOutgoingConnectionsAsync(Guid thoughtId, CancellationToken cancellationToken = default)
    {
        var connections = await _connectionRepository.GetOutgoingConnectionsAsync(thoughtId, cancellationToken);
        
        return connections.Select(c => new ThoughtConnectionResponse
        {
            Id = c.Id,
            SourceThoughtId = c.SourceThoughtId,
            TargetThoughtId = c.TargetThoughtId,
            SourceThoughtTitle = c.SourceThought?.Title,
            TargetThoughtTitle = c.TargetThought?.Title,
            ConnectionType = c.ConnectionType,
            Description = c.Description,
            Strength = c.Strength,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<IEnumerable<ThoughtConnectionResponse>> GetIncomingConnectionsAsync(Guid thoughtId, CancellationToken cancellationToken = default)
    {
        var connections = await _connectionRepository.GetIncomingConnectionsAsync(thoughtId, cancellationToken);
        
        return connections.Select(c => new ThoughtConnectionResponse
        {
            Id = c.Id,
            SourceThoughtId = c.SourceThoughtId,
            TargetThoughtId = c.TargetThoughtId,
            SourceThoughtTitle = c.SourceThought?.Title,
            TargetThoughtTitle = c.TargetThought?.Title,
            ConnectionType = c.ConnectionType,
            Description = c.Description,
            Strength = c.Strength,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<IEnumerable<ThoughtResponse>> GetRelatedThoughtsAsync(Guid thoughtId, int maxDepth = 1, CancellationToken cancellationToken = default)
    {
        if (maxDepth < 1 || maxDepth > 5)
        {
            throw new ValidationException("Max depth must be between 1 and 5");
        }
        
        var relatedThoughts = await _connectionRepository.GetRelatedThoughtsAsync(thoughtId, maxDepth, cancellationToken);
        return _mapper.Map<IEnumerable<ThoughtResponse>>(relatedThoughts);
    }

    public async Task<ThoughtConnectionResponse> UpdateConnectionAsync(Guid id, ThoughtConnectionRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        
        // Validierung
        var validationContext = new ValidationContext(request);
        var validationResults = new List<ValidationResult>();
        
        if (!Validator.TryValidateObject(request, validationContext, validationResults, true))
        {
            var errors = string.Join("; ", validationResults.Select(r => r.ErrorMessage));
            throw new ValidationException($"Validation failed: {errors}");
        }
        
        var existing = await _connectionRepository.GetByIdAsync(id, cancellationToken);
        if (existing == null)
        {
            throw new ValidationException($"Connection with ID {id} not found");
        }
        
        existing.ConnectionType = request.ConnectionType;
        existing.Description = request.Description;
        existing.Strength = request.Strength;
        
        var updated = await _connectionRepository.UpdateAsync(existing, cancellationToken);
        
        return new ThoughtConnectionResponse
        {
            Id = updated.Id,
            SourceThoughtId = updated.SourceThoughtId,
            TargetThoughtId = updated.TargetThoughtId,
            SourceThoughtTitle = updated.SourceThought?.Title,
            TargetThoughtTitle = updated.TargetThought?.Title,
            ConnectionType = updated.ConnectionType,
            Description = updated.Description,
            Strength = updated.Strength,
            CreatedAt = updated.CreatedAt
        };
    }

    public async Task<bool> DeleteConnectionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _connectionRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<bool> ConnectionExistsAsync(Guid sourceId, Guid targetId, CancellationToken cancellationToken = default)
    {
        var connection = await _connectionRepository.GetConnectionBetweenAsync(sourceId, targetId, cancellationToken);
        return connection != null;
    }
}