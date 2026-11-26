using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Responses;

public record ThoughtResponse(
    Guid Id,
    string Title,
    string Content,
    string Category,
    int? Importance,
    string? Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    List<string> Tags,
    int? ConnectionsCount = 0)
    : IResponse;

