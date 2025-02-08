using Chronoughts.Api.Contracts.Requests;
using Chronoughts.Api.Contracts.Responses;
using Chronoughts.Api.Services;
using Microsoft.AspNetCore.Mvc;

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
            group.MapGet("/{id}", async (
                IThoughtService thoughtService,
                int id,
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
                SearchThoughtRequest request,
                CancellationToken cancellationToken) =>
            {
                if (!string.IsNullOrEmpty(request.Category))
                {
                    return Results.Ok(await thoughtService.GetByCategoryAsync(request, cancellationToken));
                }

                if (!request.Tags.Any(x => string.IsNullOrEmpty(x)))
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
            group.MapPut("/{id}", async (
                IThoughtService thoughtService,
                int id,
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
            group.MapDelete("/{id}", async (
                IThoughtService thoughtService,
                int id,
                CancellationToken cancellationToken) =>
            {
                await thoughtService.DeleteAsync(id, cancellationToken);
                return Results.NoContent();
            })
            .WithName("DeleteThought")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);
        }
    }
}
