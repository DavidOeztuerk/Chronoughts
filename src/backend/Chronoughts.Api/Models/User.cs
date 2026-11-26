using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    
    // Navigation Properties
    public ICollection<Thought> Thoughts { get; set; } = [];
    public ICollection<UserRole> UserRoles { get; set; } = [];
}

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = [];
}

public class UserRole
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
