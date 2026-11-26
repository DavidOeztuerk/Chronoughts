using Chronoughts.Api.Models;

namespace Chronoughts.Api.Data.Repositories;

public class ThoughtRepositoryImpl : ThoughtRepository<Thought>, IThoughtRepository
{
    public ThoughtRepositoryImpl(ChronoughtsDbContext context) : base(context)
    {
    }
}