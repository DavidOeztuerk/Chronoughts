using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Models;

namespace Chronoughts.Api.Profile;

public class MappingProfile : AutoMapper.Profile
{
    public MappingProfile()
    {
        CreateMap<ThoughtRequest, Thought>();
        CreateMap<Thought, ThoughtResponse>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}
