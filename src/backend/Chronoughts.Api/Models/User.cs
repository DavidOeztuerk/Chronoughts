using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class User : BaseEntity
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
}
