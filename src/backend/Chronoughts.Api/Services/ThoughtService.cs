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

    public async Task<ThoughtResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
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

    public async Task<ThoughtResponse> UpdateAsync(int id, ThoughtRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Entity with id {id} not found");

        _mapper.Map(request, entity);
        await _repository.UpdateAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ThoughtResponse>(entity);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
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
}
