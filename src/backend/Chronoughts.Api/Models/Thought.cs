using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class Thought : BaseEntity
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Category { get; set; }
    public string? Notes { get; set; }
    public ICollection<string> Tags { get; set; } = [];
}
