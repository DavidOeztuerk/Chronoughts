using System.Linq.Expressions;
using Chronoughts.Api.Common;
using Chronoughts.Api.Contracts.Requests;

namespace Chronoughts.Api.Extensions;

public static class TextSearchExtensions
{
    private static readonly char[] WordSeparators = [' ', '.', ',', '!', '?', ';', ':', '-', '\n', '\r', '\t'];

    public static IQueryable<T> SearchInContent<T>(
         this IQueryable<T> query,
         SearchThoughtRequest request)
         where T : BaseEntity
    {
        if (string.IsNullOrWhiteSpace(request.SearchText))
            return query;

        var options = request.SearchOptions ?? new SearchOptions();
        var searchTerms = PrepareSearchTerms(request.SearchText, options);

        if (!searchTerms.Any())
            return query;

        var param = Expression.Parameter(typeof(T), "x");
        var contentAccess = Expression.PropertyOrField(param, "Content");

        Expression? combinedExpression = null;

        foreach (var term in searchTerms)
        {
            var containsExp = Expression.Call(
                contentAccess,
                "Contains",
                Type.EmptyTypes,
                Expression.Constant(term),
                Expression.Constant(options.CaseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase)
            );

            combinedExpression = combinedExpression == null
                ? containsExp
                : options.MatchAll
                    ? Expression.AndAlso(combinedExpression, containsExp)
                    : Expression.OrElse(combinedExpression, containsExp);
        }

        var lambda = Expression.Lambda<Func<T, bool>>(
            combinedExpression ?? Expression.Constant(true),
            param);

        return query.Where(lambda);
    }

    public static IQueryable<T> WithTags<T>(
        this IQueryable<T> query,
        IEnumerable<string>? tags,
        Expression<Func<T, IEnumerable<string>>> tagSelector)
        where T : class
    {
        if (tags == null || !tags.Any())
            return query;

        var parameter = tagSelector.Parameters[0];
        var tagsAccess = tagSelector.Body;

        var containsMethod = typeof(Enumerable)
            .GetMethods()
            .First(m => m.Name == "Contains" && m.GetParameters().Length == 2)
            .MakeGenericMethod(typeof(string));

        Expression? combinedExpression = null;

        foreach (var tag in tags)
        {
            var containsExpression = Expression.Call(
                containsMethod,
                tagsAccess,
                Expression.Constant(tag)
            );

            combinedExpression = combinedExpression == null
                ? containsExpression
                : Expression.AndAlso(combinedExpression, containsExpression);
        }

        var lambda = Expression.Lambda<Func<T, bool>>(
            combinedExpression ?? Expression.Constant(true),
            parameter);

        return query.Where(lambda);
    }

    private static List<string> PrepareSearchTerms(string searchText, SearchOptions options)
    {
        var terms = searchText
            .Split(WordSeparators, StringSplitOptions.RemoveEmptyEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => options.CaseSensitive ? x : x.ToLowerInvariant());

        if (options.ExactMatch)
            return [searchText];

        if (options.MinTermLength > 0)
            terms = terms.Where(t => t.Length >= options.MinTermLength);

        return terms.ToList();
    }
}