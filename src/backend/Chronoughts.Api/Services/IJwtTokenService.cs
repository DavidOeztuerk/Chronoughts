using System.Security.Claims;
using Chronoughts.Api.Models;

namespace Chronoughts.Api.Services;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, List<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}