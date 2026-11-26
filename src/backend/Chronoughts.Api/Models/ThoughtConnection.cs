using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class ThoughtConnection : BaseEntity
{
    public Guid SourceThoughtId { get; set; }
    public Thought? SourceThought { get; set; }
    
    public Guid TargetThoughtId { get; set; }
    public Thought? TargetThought { get; set; }
    
    public ConnectionType ConnectionType { get; set; }
    public string? Description { get; set; }
    public double Strength { get; set; } = 1.0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ConnectionType
{
    RelatesTo,
    EvolvesFrom,
    Contradicts,
    Implements,
    GroupsWith,
    References,
    Continues,
    Replaces
}