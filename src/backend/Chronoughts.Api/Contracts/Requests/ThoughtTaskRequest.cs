using System.ComponentModel.DataAnnotations;
using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Requests;

public record ThoughtTaskRequest : IRequest, IValidatableObject
{
    [Required(ErrorMessage = "Thought ID is required")]
    public Guid ThoughtId { get; init; }
    
    [Required(ErrorMessage = "Title is required")]
    [MinLength(1, ErrorMessage = "Title cannot be empty")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; init; } = string.Empty;
    
    [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string? Description { get; init; }
    
    [EnumDataType(typeof(Models.TaskStatus), ErrorMessage = "Invalid task status")]
    public Models.TaskStatus Status { get; init; } = Models.TaskStatus.Todo;
    
    [EnumDataType(typeof(Models.TaskPriority), ErrorMessage = "Invalid task priority")]
    public Models.TaskPriority Priority { get; init; } = Models.TaskPriority.Medium;
    
    [EnumDataType(typeof(Models.TaskType), ErrorMessage = "Invalid task type")]
    public Models.TaskType Type { get; init; } = Models.TaskType.Task;
    
    public DateTime? DueDate { get; init; }
    
    [Range(0, 1000, ErrorMessage = "Estimated hours must be between 0 and 1000")]
    public int EstimatedHours { get; init; }
    
    public Guid? ParentTaskId { get; init; }
    
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DueDate.HasValue && DueDate.Value < DateTime.UtcNow.Date)
        {
            yield return new ValidationResult(
                "Due date cannot be in the past",
                new[] { nameof(DueDate) });
        }
        
        if (Type == Models.TaskType.Task && ParentTaskId == null)
        {
            // Tasks sollten normalerweise unter UserStories stehen
            yield return new ValidationResult(
                "Tasks should typically have a parent (UserStory, Feature, or Epic)",
                new[] { nameof(ParentTaskId) });
        }
        
        if (Status == Models.TaskStatus.Done && EstimatedHours == 0)
        {
            yield return new ValidationResult(
                "Completed tasks should have estimated hours",
                new[] { nameof(EstimatedHours) });
        }
    }
}