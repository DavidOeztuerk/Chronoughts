using Chronoughts.Api.Common;

namespace Chronoughts.Api.Contracts.Requests;

public record UserRequest(
    string Username,
    string Email,
    string Password)
    : IRequest;

