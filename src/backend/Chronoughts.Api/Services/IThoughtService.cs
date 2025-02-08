using Chronoughts.Api.Common;
using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;

namespace Chronoughts.Api.Services;

public interface IThoughtService<TResponse, TRequest>
    : IBaseService<TResponse, TRequest>
    where TResponse : class, IResponse
    where TRequest : class, IRequest
{
    Task<IEnumerable<TResponse>> GetByTagAsync(SearchThoughtRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<TResponse>> GetByCategoryAsync(SearchThoughtRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<TResponse>> SearchAsync(SearchThoughtRequest request, CancellationToken cancellationToken = default);
}


public interface IThoughtService : IThoughtService<ThoughtResponse, ThoughtRequest>
{
}