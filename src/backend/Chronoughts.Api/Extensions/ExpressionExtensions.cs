using System.Linq.Expressions;

namespace Chronoughts.Api.Extensions;

public static class ExpressionBuilder
{
    public static Expression<Func<T, bool>> BuildPredicate<T>(T request)
    {
        var param = Expression.Parameter(typeof(T), "x");
        var conditions = new List<Expression>();

        foreach (var prop in typeof(T).GetProperties())
        {
            var value = prop.GetValue(request, null);

            if (value != null)
            {
                var propExpr = Expression.Property(param, prop.Name);
                var constantExpr = Expression.Constant(value);
                var equalExpr = Expression.Equal(propExpr, constantExpr);

                conditions.Add(equalExpr);
            }
        }

        if (conditions.Count == 0)
        {
            return Expression.Lambda<Func<T, bool>>(Expression.Constant(true), param);
        }

        var combinedCondition = conditions.Aggregate(Expression.AndAlso);

        return Expression.Lambda<Func<T, bool>>(combinedCondition, param);
    }
}
