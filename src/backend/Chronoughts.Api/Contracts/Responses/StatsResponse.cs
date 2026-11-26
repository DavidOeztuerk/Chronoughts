namespace Chronoughts.Api.Contracts.Responses
{
    public class StatsResponse
    {
        public int TotalThoughts { get; set; }
        public int TotalConnections { get; set; }
        public int ActiveTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int WeeklyThoughts { get; set; }
        public int MonthlyThoughts { get; set; }
        public int ActiveDays { get; set; }
        public Dictionary<string, int> CategoriesCount { get; set; } = new();
        public Dictionary<string, int> TagsCount { get; set; } = new();
        public double AverageImportance { get; set; }
    }
}