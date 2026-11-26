using System.Security.Claims;
using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Chronoughts.Api.Extensions;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("Authentication")
            .WithOpenApi();

        // POST /api/v1/auth/register
        group.MapPost("/register", async (
            IAuthenticationService authService,
            [FromBody] RegisterRequest request,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var response = await authService.RegisterAsync(request, cancellationToken);
                return Results.Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("Register")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .AllowAnonymous();

        // POST /api/v1/auth/login
        group.MapPost("/login", async (
            IAuthenticationService authService,
            [FromBody] LoginRequest request,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var response = await authService.LoginAsync(request, cancellationToken);
                return Results.Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine(ex.Message);
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("Login")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .AllowAnonymous();

        // POST /api/v1/auth/refresh
        group.MapPost("/refresh", async (
            IAuthenticationService authService,
            [FromBody] RefreshTokenRequest request,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var response = await authService.RefreshTokenAsync(request, cancellationToken);
                return Results.Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine(ex.Message);
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("RefreshToken")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .AllowAnonymous();

        // POST /api/v1/auth/change-password
        group.MapPost("/change-password", [Authorize] async (
            IAuthenticationService authService,
            [FromBody] ChangePasswordRequest request,
            ClaimsPrincipal user,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
                var result = await authService.ChangePasswordAsync(userId, request, cancellationToken);
                return result ? Results.Ok(new { message = "Password changed successfully" }) : Results.BadRequest();
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine(ex.Message);
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("ChangePassword")
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

        // POST /api/v1/auth/logout
        group.MapPost("/logout", [Authorize] async (
            IAuthenticationService authService,
            ClaimsPrincipal user,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
                await authService.RevokeTokenAsync(userId, cancellationToken);
                return Results.Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("Logout")
        .Produces(StatusCodes.Status200OK)
        .RequireAuthorization();

        // GET /api/v1/auth/me
        group.MapGet("/me", [Authorize] async (
            IAuthenticationService authService,
            ClaimsPrincipal user,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
                var userInfo = await authService.GetUserInfoAsync(userId, cancellationToken);
                return userInfo != null ? Results.Ok(userInfo) : Results.NotFound();
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        })
        .WithName("GetCurrentUser")
        .Produces<UserInfoResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();

        // GET /api/v1/auth/validate
        group.MapGet("/validate", [Authorize] (ClaimsPrincipal user) =>
        {
            var response = new TokenValidationResponse
            {
                IsValid = user.Identity?.IsAuthenticated ?? false,
                Username = user.FindFirst(ClaimTypes.Name)?.Value,
                Roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList(),
                ExpiresAt = DateTimeOffset.FromUnixTimeSeconds(
                    long.Parse(user.FindFirst("exp")?.Value ?? "0")).UtcDateTime
            };

            return Results.Ok(response);
        })
        .WithName("ValidateToken")
        .Produces<TokenValidationResponse>(StatusCodes.Status200OK)
        .RequireAuthorization();
    }
}