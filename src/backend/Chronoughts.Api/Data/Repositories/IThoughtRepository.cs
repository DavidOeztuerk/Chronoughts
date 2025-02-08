using Chronoughts.Api.Common;

namespace Chronoughts.Api.Data.Repositories;

public interface IThoughtRepository<T>
    : IRepository<T>
    where T : BaseEntity
{
    Task<IEnumerable<T>> GetByTagAsync(string tag, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
}
