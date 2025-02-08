using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Requests;

public record ThoughtRequest(
    string Title,
    string Content,
    string Category,
    List<string> Tags)
    : IRequest;


public class SearchOptions
{
    public bool CaseSensitive { get; set; } = false;
    public bool ExactMatch { get; set; } = false;
    public bool MatchAll { get; set; } = true;
    public int MinTermLength { get; set; } = 2;
}


public class SearchThoughtRequest : IRequest
{
    public string? SearchText { get; set; }
    public string? Category { get; set; }
    public SearchOptions? SearchOptions { get; set; }
    public List<string> Tags { get; set; } = [];
}