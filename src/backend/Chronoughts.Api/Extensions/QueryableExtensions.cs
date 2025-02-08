using Chronoughts.Api.Common;
using Chronoughts.Api.Data.Repositories;

namespace Chronoughts.Api.Extensions;

public static class QueryableExtensions
{
    public static async Task<IQueryable<T>> AsQueryable<T>(
        this IThoughtRepository<T> repository,
        CancellationToken cancellationToken = default)
        where T : BaseEntity
    {
        return await Task.Run(async () =>
        {
            var queryable = await repository.GetAllAsync();
            return queryable.AsQueryable();
        }, cancellationToken);
    }
}