using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Responses;

public record AuthResponse : IResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public string TokenType { get; init; } = "Bearer";
    public int ExpiresIn { get; init; }
    public UserInfoResponse User { get; init; } = new();
}

public record UserInfoResponse : IResponse
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public List<string> Roles { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

public record TokenValidationResponse : IResponse
{
    public bool IsValid { get; init; }
    public string? Username { get; init; }
    public List<string> Roles { get; init; } = [];
    public DateTime? ExpiresAt { get; init; }
}