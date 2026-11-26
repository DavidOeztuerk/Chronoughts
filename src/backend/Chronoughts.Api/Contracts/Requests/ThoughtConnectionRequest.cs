using System.ComponentModel.DataAnnotations;
using Chronoughts.Api.Common;
using Chronoughts.Api.Models;

namespace Chronoughts.Api.Contracts.Requests;

public record ThoughtConnectionRequest : IRequest
{
    [Required(ErrorMessage = "Source thought ID is required")]
    public Guid SourceThoughtId { get; init; }
    
    [Required(ErrorMessage = "Target thought ID is required")]
    public Guid TargetThoughtId { get; init; }
    
    [Required(ErrorMessage = "Connection type is required")]
    [EnumDataType(typeof(ConnectionType), ErrorMessage = "Invalid connection type")]
    public ConnectionType ConnectionType { get; init; }
    
    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; init; }
    
    [Range(0.1, 1.0, ErrorMessage = "Strength must be between 0.1 and 1.0")]
    public double Strength { get; init; } = 1.0;
    
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (SourceThoughtId == TargetThoughtId)
        {
            yield return new ValidationResult(
                "A thought cannot be connected to itself",
                new[] { nameof(SourceThoughtId), nameof(TargetThoughtId) });
        }
    }
}