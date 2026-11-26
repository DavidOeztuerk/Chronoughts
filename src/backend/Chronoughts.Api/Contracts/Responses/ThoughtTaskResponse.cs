using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Responses;

public record ThoughtTaskResponse : IResponse
{
    public Guid Id { get; init; }
    public Guid ThoughtId { get; init; }
    public string? ThoughtTitle { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Models.TaskStatus Status { get; init; }
    public Models.TaskPriority Priority { get; init; }
    public Models.TaskType Type { get; init; }
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public int EstimatedHours { get; init; }
    public int? ActualHours { get; init; }
    public Guid? ParentTaskId { get; init; }
    public string? ParentTaskTitle { get; init; }
    public List<ThoughtTaskResponse> SubTasks { get; init; } = [];
    public int Progress { get; init; }
}