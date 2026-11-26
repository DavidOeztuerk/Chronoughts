using AutoMapper;
using Chronoughts.Api.Data.Repositories;
using Chronoughts.Api.Exceptions;
using System.Linq.Expressions;
using Chronoughts.Api.Models;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Chronoughts.Api.Services;

public class ThoughtService<T>(
    IThoughtRepository<T> repository,
    IMapper mapper)
    : IThoughtService
    where T : Thought
{
    private readonly IThoughtRepository<T> _repository = repository;
    private readonly IMapper _mapper = mapper;

    public async Task<ThoughtResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return _mapper.Map<ThoughtResponse>(entity);
    }

    public async Task<IEnumerable<ThoughtResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<ThoughtResponse>>(entities);
    }

    public async Task<IEnumerable<ThoughtResponse>> FindAsync(Expression<Func<ThoughtRequest, bool>> predicate, CancellationToken cancellationToken = default)
    {
        var entityPredicate = _mapper.Map<Expression<Func<T, bool>>>(predicate);
        var entities = await _repository.FindAsync(entityPredicate, cancellationToken);
        return _mapper.Map<IEnumerable<ThoughtResponse>>(entities);
    }

    public async Task<ThoughtResponse> CreateAsync(ThoughtRequest request, CancellationToken cancellationToken = default)
    {
        var entity = _mapper.Map<T>(request);
        await _repository.AddAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ThoughtResponse>(entity);
    }

    public async Task<ThoughtResponse> UpdateAsync(Guid id, ThoughtRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Entity with id {id} not found");

        _mapper.Map(request, entity);
        await _repository.UpdateAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ThoughtResponse>(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Entity with id {id} not found");

        await _repository.DeleteAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<ThoughtResponse>> GetByCategoryAsync(SearchThoughtRequest request, CancellationToken cancellationToken = default)
    {
        var thoughts = await this._repository.GetByCategoryAsync(request.Category ?? "", cancellationToken);
        return this._mapper.Map<IEnumerable<ThoughtResponse>>(thoughts);
    }

    public async Task<IEnumerable<ThoughtResponse>> GetByTagAsync(SearchThoughtRequest request, CancellationToken cancellationToken = default)
    {
        var thoughts = new List<Thought>();
        foreach (var tag in request.Tags)
        {
            var tagThoughts = await this._repository.GetByTagAsync(tag, cancellationToken);
            thoughts.AddRange(tagThoughts);
        }
        return this._mapper.Map<IEnumerable<ThoughtResponse>>(thoughts);
    }

    public async Task<IEnumerable<ThoughtResponse>> SearchAsync(SearchThoughtRequest request, CancellationToken cancellationToken = default)
    {
        var query = await _repository.AsQueryable(cancellationToken);

        query = query.SearchInContent(request);

        var results = await query.ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<ThoughtResponse>>(results);
    }

    public async Task<StatsResponse> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var thoughts = await _repository.GetAllAsync(cancellationToken);
        var thoughtsList = thoughts.ToList();
        var now = DateTime.UtcNow;
        var weekAgo = now.AddDays(-7);
        var monthAgo = now.AddDays(-30);

        var stats = new StatsResponse
        {
            TotalThoughts = thoughtsList.Count,
            TotalConnections = 0, // TODO: Implement when connections are available
            ActiveTasks = thoughtsList.Count(t => t.Category?.ToLower() == "task"),
            CompletedTasks = 0, // TODO: Implement when task status is available
            WeeklyThoughts = thoughtsList.Count(t => t.CreatedAt >= weekAgo),
            MonthlyThoughts = thoughtsList.Count(t => t.CreatedAt >= monthAgo),
            ActiveDays = thoughtsList.GroupBy(t => t.CreatedAt.Date).Count(),
            CategoriesCount = thoughtsList
                .GroupBy(t => t.Category ?? "uncategorized")
                .ToDictionary(g => g.Key, g => g.Count()),
            TagsCount = thoughtsList
                .SelectMany(t => t.Tags ?? new List<string>())
                .GroupBy(tag => tag)
                .ToDictionary(g => g.Key, g => g.Count()),
            AverageImportance = thoughtsList.Any() ? thoughtsList.Average(t => t.Importance ?? 3) : 0
        };

        return stats;
    }

    public async Task<IEnumerable<ActivityResponse>> GetRecentActivityAsync(int limit = 10, CancellationToken cancellationToken = default)
    {
        var thoughts = await _repository.GetAllAsync(cancellationToken);
        var recentThoughts = thoughts
            .OrderByDescending(t => t.UpdatedAt)
            .Take(limit)
            .Select(t => new ActivityResponse
            {
                Type = t.UpdatedAt > t.CreatedAt.AddMinutes(1) ? "updated" : "created",
                Description = t.UpdatedAt > t.CreatedAt.AddMinutes(1)
                    ? $"Updated thought: {t.Title}"
                    : $"Created thought: {t.Title}",
                Timestamp = t.UpdatedAt != null ? t.UpdatedAt.Value : DateTime.UtcNow,
                ThoughtId = t.Id.ToString(),
                ThoughtTitle = t.Title,
                Metadata = new Dictionary<string, object>
                {
                    ["category"] = t.Category ?? "uncategorized",
                    ["importance"] = t.Importance ?? 3
                }
            });

        return recentThoughts;
    }
}
