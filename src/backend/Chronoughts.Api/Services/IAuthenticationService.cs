using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;

namespace Chronoughts.Api.Services;

public interface IAuthenticationService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<bool> RevokeTokenAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserInfoResponse?> GetUserInfoAsync(Guid userId, CancellationToken cancellationToken = default);
}