using Chronoughts.Api.Common;

namespace Chronoughts.Api.Models;

public class Thought : BaseEntity
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Category { get; set; }
    public string? Notes { get; set; }
    public int? Importance { get; set; } = 3; // 1-5 scale, default 3
    public string? Status { get; set; } = "active"; // active, archived, completed, pending
    
    // Legacy tags support für Kompatibilität
    public ICollection<string> Tags { get; set; } = [];
    
    // Neue Relationen
    public ICollection<ThoughtTag> ThoughtTags { get; set; } = [];
    public ICollection<ThoughtConnection> OutgoingConnections { get; set; } = [];
    public ICollection<ThoughtConnection> IncomingConnections { get; set; } = [];
    public ICollection<ThoughtTask> Tasks { get; set; } = [];
    
    // Versionierung
    public int Version { get; set; } = 1;
    public Guid? PreviousVersionId { get; set; }
    public Thought? PreviousVersion { get; set; }
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
    public int ViewCount { get; set; }
}
