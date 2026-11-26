using System.Linq.Expressions;

namespace Chronoughts.Api.Common;

public interface IBaseService<TResponse, TRequest>
    where TResponse : IResponse
    where TRequest : IRequest
{
    Task<TResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<TResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TResponse>> FindAsync(Expression<Func<TRequest, bool>> predicate, CancellationToken cancellationToken = default);
    Task<TResponse> CreateAsync(TRequest entity, CancellationToken cancellationToken = default);
    Task<TResponse> UpdateAsync(Guid id, TRequest entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}