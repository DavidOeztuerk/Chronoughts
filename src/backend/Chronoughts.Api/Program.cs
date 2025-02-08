using Chronoughts.Api.Data;
using Chronoughts.Api.Extensions;
using Chronoughts.Api.Profile;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Services.AddDbContext<ChronoughtsDbContext>(opt =>
    {
        opt.UseInMemoryDatabase("InMemoryDb");
    });

    builder.Services
        .AddRepositories()
        .AddServices()
        .AddEndpointsApiExplorer()
        .AddAutoMapper(typeof(MappingProfile))
        .AddHealthChecks();

    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Thoughts API",
            Version = "v1",
            Description = "An API for managing thoughts"
        });
    });

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigin",
            builder => builder
                .WithOrigins("http://localhost:3000") // Beispiel für Frontend URL
                .AllowAnyMethod()
                .AllowAnyHeader());
    });
}

var app = builder.Build();
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Thoughts API V1");
        });
    }

    app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (exceptionHandlerFeature != null)
        {
            var exception = exceptionHandlerFeature.Error;
            await context.Response.WriteAsJsonAsync(new
            {
                StatusCode = 500,
                Message = "An error occurred while processing your request.",
                Detail = app.Environment.IsDevelopment() ? exception.Message : null
            });
        }
    });
});

    app.UseCors("AllowSpecificOrigin");

    app.MapThoughtEndpoints();

    app.MapHealthChecks("/health");

    app.Run();
}



