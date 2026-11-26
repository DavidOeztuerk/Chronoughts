using System.ComponentModel.DataAnnotations;
using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Requests;

public record LoginRequest : IRequest
{
    [Required(ErrorMessage = "Username or Email is required")]
    public string UsernameOrEmail { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Password is required")]
    public string Password { get; init; } = string.Empty;
}

public record RegisterRequest : IRequest, IValidatableObject
{
    [Required(ErrorMessage = "Username is required")]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    [MaxLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
    public string Username { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; init; } = string.Empty;
    
    [MaxLength(50)]
    public string? FirstName { get; init; }
    
    [MaxLength(50)]
    public string? LastName { get; init; }
    
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Additional password complexity validation
        if (!string.IsNullOrEmpty(Password))
        {
            bool hasNumber = Password.Any(char.IsDigit);
            bool hasLetter = Password.Any(char.IsLetter);
            
            if (!hasNumber || !hasLetter)
            {
                yield return new ValidationResult(
                    "Password must contain at least one letter and one number",
                    new[] { nameof(Password) });
            }
        }
    }
}

public record RefreshTokenRequest : IRequest
{
    [Required(ErrorMessage = "Access token is required")]
    public string AccessToken { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; init; } = string.Empty;
}

public record ChangePasswordRequest : IRequest
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "New password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string NewPassword { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare(nameof(NewPassword), ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; init; } = string.Empty;
}