using Chronoughts.Api.Common;
using Chronoughts.Api.Models;

namespace Chronoughts.Api.Contracts.Responses;

public record ThoughtConnectionResponse : IResponse
{
    public Guid Id { get; init; }
    public Guid SourceThoughtId { get; init; }
    public Guid TargetThoughtId { get; init; }
    public string? SourceThoughtTitle { get; init; }
    public string? TargetThoughtTitle { get; init; }
    public ConnectionType ConnectionType { get; init; }
    public string? Description { get; init; }
    public double Strength { get; init; }
    public DateTime CreatedAt { get; init; }
}