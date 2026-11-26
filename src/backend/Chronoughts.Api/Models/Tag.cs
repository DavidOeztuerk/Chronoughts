using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<ThoughtTag> ThoughtTags { get; set; } = [];
}

public class ThoughtTag
{
    public Guid ThoughtId { get; set; }
    public Thought? Thought { get; set; }
    
    public Guid TagId { get; set; }
    public Tag? Tag { get; set; }
}