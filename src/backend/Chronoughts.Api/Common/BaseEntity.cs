namespace Chronoughts.Api.Common;

public class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
}
