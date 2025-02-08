using Chronoughts.Api.Data.Repositories;
using Chronoughts.Api.Models;
using Chronoughts.Api.Services;

namespace Chronoughts.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IThoughtService, ThoughtService<Thought>>();
        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IThoughtRepository<Thought>, ThoughtRepository<Thought>>();
        return services;
    }
}