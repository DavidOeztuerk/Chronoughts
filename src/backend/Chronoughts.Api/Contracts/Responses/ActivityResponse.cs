namespace Chronoughts.Api.Contracts.Responses
{
    public class ActivityResponse
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? ThoughtId { get; set; }
        public string? ThoughtTitle { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}