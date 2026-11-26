using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Chronoughts.Api.Extensions
{
    public static class ApiEndpoints
    {
        public static void MapThoughtEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/v1/thoughts")
                            .WithTags("Thoughts")
                            .WithOpenApi();

            // GET thought by id
            group.MapGet("/{id:guid}", async (
                IThoughtService thoughtService,
                Guid id,
                CancellationToken cancellationToken) =>
            {
                var thought = await thoughtService.GetByIdAsync(id, cancellationToken);
                if (thought == null) return Results.NotFound();
                return Results.Ok(thought);
            })
            .WithName("GetThoughtById")
            .Produces<ThoughtResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound);

            // GET all thoughts with optional filters
            group.MapGet("", async (
                IThoughtService thoughtService,
                [FromQuery] string? category,
                [FromQuery] string? searchText,
                [FromQuery] string? tag,
                CancellationToken cancellationToken) =>
            {
                var request = new SearchThoughtRequest 
                { 
                    Category = category,
                    SearchText = searchText,
                    Tags = string.IsNullOrEmpty(tag) ? [] : [tag]
                };
                
                if (!string.IsNullOrEmpty(request.Category))
                {
                    return Results.Ok(await thoughtService.GetByCategoryAsync(request, cancellationToken));
                }

                if (request.Tags.Any())
                {
                    return Results.Ok(await thoughtService.GetByTagAsync(request, cancellationToken));
                }

                if (!string.IsNullOrEmpty(request.SearchText))
                {
                    return Results.Ok(await thoughtService.SearchAsync(request, cancellationToken));
                }

                var thoughts = await thoughtService.GetAllAsync(cancellationToken);
                return Results.Ok(thoughts);
            })
            .WithName("GetThoughts")
            .Produces<List<ThoughtResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

            // POST search thoughts
            group.MapPost("/search", async (
                IThoughtService thoughtService,
                [FromBody] ThoughtRequest request,
                CancellationToken cancellationToken) =>
            {
                var predicate = ExpressionBuilder.BuildPredicate(request);
                var thoughts = await thoughtService.FindAsync(predicate, cancellationToken);
                return Results.Ok(thoughts);
            })
            .WithName("SearchThoughts")
            .Produces<List<ThoughtResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest);

            // POST new thought
            group.MapPost("", async (
                IThoughtService thoughtService,
                [FromBody] ThoughtRequest request,
                CancellationToken cancellationToken) =>
            {
                var thought = await thoughtService.CreateAsync(request, cancellationToken);
                return Results.Created($"/api/v1/thoughts/{thought.Id}", thought);
            })
            .WithName("CreateThought")
            .Produces<ThoughtResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);

            // PUT update thought
            group.MapPut("/{id:guid}", async (
                IThoughtService thoughtService,
                Guid id,
                [FromBody] ThoughtRequest request,
                CancellationToken cancellationToken) =>
            {
                var thought = await thoughtService.UpdateAsync(id, request, cancellationToken);
                return thought != null ? Results.Ok(thought) : Results.NotFound();
            })
            .WithName("UpdateThought")
            .Produces<ThoughtResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound);

            // DELETE thought
            group.MapDelete("/{id:guid}", async (
                IThoughtService thoughtService,
                Guid id,
                CancellationToken cancellationToken) =>
            {
                await thoughtService.DeleteAsync(id, cancellationToken);
                return Results.NoContent();
            })
            .WithName("DeleteThought")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

            // GET stats
            group.MapGet("/stats", async (
                IThoughtService thoughtService,
                CancellationToken cancellationToken) =>
            {
                var stats = await thoughtService.GetStatsAsync(cancellationToken);
                return Results.Ok(stats);
            })
            .WithName("GetThoughtStats")
            .Produces<StatsResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

            // GET recent activity
            group.MapGet("/activity", async (
                IThoughtService thoughtService,
                [FromQuery] int limit,
                CancellationToken cancellationToken) =>
            {
                var activity = await thoughtService.GetRecentActivityAsync(limit > 0 ? limit : 10, cancellationToken);
                return Results.Ok(activity);
            })
            .WithName("GetRecentActivity")
            .Produces<List<ActivityResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status500InternalServerError);
        }

        public static void MapThoughtConnectionEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/v1/connections")
                            .WithTags("Thought Connections")
                            .WithOpenApi();

            // GET connection by id
            group.MapGet("/{id:guid}", async (
                IThoughtConnectionService connectionService,
                Guid id,
                CancellationToken cancellationToken) =>
            {
                var connection = await connectionService.GetConnectionAsync(id, cancellationToken);
                return connection == null ? Results.NotFound() : Results.Ok(connection);
            })
            .WithName("GetConnectionById")
            .Produces<ThoughtConnectionResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound);

            // GET connections by thought
            group.MapGet("/thought/{thoughtId:guid}", async (
                IThoughtConnectionService connectionService,
                Guid thoughtId,
                CancellationToken cancellationToken) =>
            {
                var connections = await connectionService.GetConnectionsByThoughtAsync(thoughtId, cancellationToken);
                return Results.Ok(connections);
            })
            .WithName("GetConnectionsByThought")
            .Produces<IEnumerable<ThoughtConnectionResponse>>(StatusCodes.Status200OK);

            // GET outgoing connections
            group.MapGet("/thought/{thoughtId:guid}/outgoing", async (
                IThoughtConnectionService connectionService,
                Guid thoughtId,
                CancellationToken cancellationToken) =>
            {
                var connections = await connectionService.GetOutgoingConnectionsAsync(thoughtId, cancellationToken);
                return Results.Ok(connections);
            })
            .WithName("GetOutgoingConnections")
            .Produces<IEnumerable<ThoughtConnectionResponse>>(StatusCodes.Status200OK);

            // GET incoming connections
            group.MapGet("/thought/{thoughtId:guid}/incoming", async (
                IThoughtConnectionService connectionService,
                Guid thoughtId,
                CancellationToken cancellationToken) =>
            {
                var connections = await connectionService.GetIncomingConnectionsAsync(thoughtId, cancellationToken);
                return Results.Ok(connections);
            })
            .WithName("GetIncomingConnections")
            .Produces<IEnumerable<ThoughtConnectionResponse>>(StatusCodes.Status200OK);

            // GET related thoughts
            group.MapGet("/thought/{thoughtId:guid}/related", async (
                IThoughtConnectionService connectionService,
                Guid thoughtId,
                [FromQuery] int maxDepth,
                CancellationToken cancellationToken) =>
            {
                var depth = maxDepth > 0 ? maxDepth : 1;
                var thoughts = await connectionService.GetRelatedThoughtsAsync(thoughtId, depth, cancellationToken);
                return Results.Ok(thoughts);
            })
            .WithName("GetRelatedThoughts")
            .Produces<IEnumerable<ThoughtResponse>>(StatusCodes.Status200OK);

            // POST create connection
            group.MapPost("", async (
                IThoughtConnectionService connectionService,
                [FromBody] ThoughtConnectionRequest request,
                CancellationToken cancellationToken) =>
            {
                try
                {
                    var connection = await connectionService.CreateConnectionAsync(request, cancellationToken);
                    return Results.Created($"/api/v1/connections/{connection.Id}", connection);
                }
                catch (ValidationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            })
            .WithName("CreateConnection")
            .Produces<ThoughtConnectionResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status400BadRequest);

            // PUT update connection
            group.MapPut("/{id:guid}", async (
                IThoughtConnectionService connectionService,
                Guid id,
                [FromBody] ThoughtConnectionRequest request,
                CancellationToken cancellationToken) =>
            {
                try
                {
                    var updated = await connectionService.UpdateConnectionAsync(id, request, cancellationToken);
                    return Results.Ok(updated);
                }
                catch (ValidationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            })
            .WithName("UpdateConnection")
            .Produces<ThoughtConnectionResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);

            // DELETE connection
            group.MapDelete("/{id:guid}", async (
                IThoughtConnectionService connectionService,
                Guid id,
                CancellationToken cancellationToken) =>
            {
                var deleted = await connectionService.DeleteConnectionAsync(id, cancellationToken);
                return deleted ? Results.NoContent() : Results.NotFound();
            })
            .WithName("DeleteConnection")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

            // GET check if connection exists
            group.MapGet("/exists", async (
                IThoughtConnectionService connectionService,
                [FromQuery] Guid sourceId,
                [FromQuery] Guid targetId,
                CancellationToken cancellationToken) =>
            {
                var exists = await connectionService.ConnectionExistsAsync(sourceId, targetId, cancellationToken);
                return Results.Ok(new { exists });
            })
            .WithName("CheckConnectionExists")
            .Produces<object>(StatusCodes.Status200OK);
        }
    }
}
