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
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));
            
        CreateMap<ThoughtConnectionRequest, ThoughtConnection>();
        CreateMap<ThoughtConnection, ThoughtConnectionResponse>()
            .ForMember(dest => dest.SourceThoughtTitle, opt => opt.MapFrom(src => src.SourceThought != null ? src.SourceThought.Title : null))
            .ForMember(dest => dest.TargetThoughtTitle, opt => opt.MapFrom(src => src.TargetThought != null ? src.TargetThought.Title : null));
            
        CreateMap<ThoughtTaskRequest, ThoughtTask>();
        CreateMap<ThoughtTask, ThoughtTaskResponse>()
            .ForMember(dest => dest.ThoughtTitle, opt => opt.MapFrom(src => src.Thought != null ? src.Thought.Title : null))
            .ForMember(dest => dest.ParentTaskTitle, opt => opt.MapFrom(src => src.ParentTask != null ? src.ParentTask.Title : null))
            .ForMember(dest => dest.Progress, opt => opt.MapFrom(src => CalculateProgress(src)));
    }
    
    private static int CalculateProgress(ThoughtTask task)
    {
        return task.Status switch
        {
            Models.TaskStatus.Todo => 0,
            Models.TaskStatus.InProgress => 25,
            Models.TaskStatus.Blocked => 25,
            Models.TaskStatus.Review => 75,
            Models.TaskStatus.Done => 100,
            Models.TaskStatus.Cancelled => 0,
            _ => 0
        };
    }
}
