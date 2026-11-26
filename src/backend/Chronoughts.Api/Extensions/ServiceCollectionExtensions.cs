using Chronoughts.Api.Data.Repositories;
using Chronoughts.Api.Models;
using Chronoughts.Api.Services;

namespace Chronoughts.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IThoughtService, ThoughtService<Thought>>();
        services.AddScoped<IThoughtConnectionService, ThoughtConnectionService>();
        return services;
    }

    public static IServiceCollection AddAuthServices(this IServiceCollection services)
    {
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IThoughtRepository<Thought>, ThoughtRepository<Thought>>();
        services.AddScoped<IThoughtRepository, ThoughtRepositoryImpl>();
        services.AddScoped<IThoughtConnectionRepository, ThoughtConnectionRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        return services;
    }
}