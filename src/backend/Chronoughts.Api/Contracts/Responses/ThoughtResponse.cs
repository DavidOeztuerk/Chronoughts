using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Responses;

public record ThoughtResponse(
    int Id,
    string Title,
    string Content,
    string Category,
    DateTime CreatedAt,
    List<string> Tags)
    : IResponse;

