using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Chronoughts.Api.Middleware;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;

    public JwtMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
        
        if (token != null)
        {
            // Token wird bereits von der JWT Bearer Authentication Middleware verarbeitet
            // Dies ist nur für zusätzliche Token-Verarbeitung falls nötig
            context.Items["Token"] = token;
        }

        // Bearer prefix hinzufügen falls nur Token gesendet wurde
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            context.Request.Headers["Authorization"] = $"Bearer {authHeader}";
        }

        await _next(context);
    }
}