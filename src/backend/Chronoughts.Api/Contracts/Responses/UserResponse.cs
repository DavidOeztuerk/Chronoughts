using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Responses;

public record UserResponse(
    int Id,
    string Username,
    string Email)
    : IResponse;

