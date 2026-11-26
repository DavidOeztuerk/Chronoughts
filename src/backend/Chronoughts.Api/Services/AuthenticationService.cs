using System.Security.Claims;
using Chronoughts.Api.Configuration;
using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Data.Repositories;
using Chronoughts.Api.Models;
using Microsoft.Extensions.Options;

namespace Chronoughts.Api.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthenticationService> logger)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByUsernameOrEmailAsync(request.UsernameOrEmail, cancellationToken);
        
        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username/email or password");
        }
        
        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is deactivated");
        }
        
        // Get user roles
        var roles = await _userRepository.GetUserRolesAsync(user.Id, cancellationToken);
        
        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        
        // Update user with refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
        user.LastLoginAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user, cancellationToken);
        
        _logger.LogInformation("User {Username} logged in successfully", user.Username);
        
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = _jwtSettings.ExpirationInMinutes * 60,
            User = MapToUserInfo(user, roles)
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check if user already exists
        if (await _userRepository.ExistsAsync(request.Username, request.Email, cancellationToken))
        {
            throw new InvalidOperationException("Username or email already exists");
        }
        
        // Create new user
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true
        };
        
        user = await _userRepository.CreateAsync(user, cancellationToken);
        
        // Assign default role
        await _userRepository.AssignRoleAsync(user.Id, "User", cancellationToken);
        var roles = new List<string> { "User" };
        
        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        
        // Update user with refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
        user.LastLoginAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user, cancellationToken);
        
        _logger.LogInformation("New user {Username} registered successfully", user.Username);
        
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = _jwtSettings.ExpirationInMinutes * 60,
            User = MapToUserInfo(user, roles)
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var principal = _jwtTokenService.GetPrincipalFromExpiredToken(request.AccessToken);
        
        if (principal == null)
        {
            throw new UnauthorizedAccessException("Invalid access token");
        }
        
        var username = principal.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username))
        {
            throw new UnauthorizedAccessException("Invalid token claims");
        }
        
        var user = await _userRepository.GetByUsernameAsync(username, cancellationToken);
        
        if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }
        
        // Get user roles
        var roles = await _userRepository.GetUserRolesAsync(user.Id, cancellationToken);
        
        // Generate new tokens
        var newAccessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();
        
        // Update user with new refresh token
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
        
        await _userRepository.UpdateAsync(user, cancellationToken);
        
        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresIn = _jwtSettings.ExpirationInMinutes * 60,
            User = MapToUserInfo(user, roles)
        };
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }
        
        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }
        
        user.PasswordHash = HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user, cancellationToken);
        
        _logger.LogInformation("User {Username} changed password successfully", user.Username);
        
        return true;
    }

    public async Task<bool> RevokeTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (user == null)
        {
            return false;
        }
        
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        
        await _userRepository.UpdateAsync(user, cancellationToken);
        
        _logger.LogInformation("Refresh token revoked for user {Username}", user.Username);
        
        return true;
    }

    public async Task<UserInfoResponse?> GetUserInfoAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (user == null)
        {
            return null;
        }
        
        var roles = await _userRepository.GetUserRolesAsync(user.Id, cancellationToken);
        
        return MapToUserInfo(user, roles);
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    private static UserInfoResponse MapToUserInfo(User user, List<string> roles)
    {
        return new UserInfoResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = roles,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}