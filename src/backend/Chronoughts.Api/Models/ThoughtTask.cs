using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class ThoughtTask : BaseEntity
{
    public Guid ThoughtId { get; set; }
    public Thought? Thought { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskType Type { get; set; } = TaskType.Task;
    
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    public int EstimatedHours { get; set; }
    public int? ActualHours { get; set; }
    
    public Guid? ParentTaskId { get; set; }
    public ThoughtTask? ParentTask { get; set; }
    public ICollection<ThoughtTask> SubTasks { get; set; } = [];
}

public enum TaskStatus
{
    Todo,
    InProgress,
    Blocked,
    Review,
    Done,
    Cancelled
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum TaskType
{
    Epic,
    Feature,
    UserStory,
    Task,
    Bug,
    Research
}