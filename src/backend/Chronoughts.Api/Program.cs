using System.Text;
using Chronoughts.Api.Configuration;
using Chronoughts.Api.Data;
using Chronoughts.Api.Extensions;
using Chronoughts.Api.Profile;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Services.AddDbContext<ChronoughtsDbContext>(opt =>
    {
        opt.UseInMemoryDatabase("InMemoryDb");
    });

    // Configure JWT Settings
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
    
    // Add Authentication
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    var key = Encoding.ASCII.GetBytes(jwtSettings!.Secret);
    
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
    
    builder.Services.AddAuthorization();
    
    builder.Services
        .AddRepositories()
        .AddServices()
        .AddAuthServices()
        .AddEndpointsApiExplorer()
        .AddAutoMapper(typeof(MappingProfile))
        .AddHealthChecks();

    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Chronoughts API",
            Version = "v1.0.0",
            Description = "Eine intelligente API zur Verwaltung und Verknüpfung von Gedanken mit Task-Management Funktionen",
            Contact = new OpenApiContact
            {
                Name = "Chronoughts Team",
                Email = "support@chronoughts.local"
            },
            License = new OpenApiLicense
            {
                Name = "MIT License",
                Url = new Uri("https://opensource.org/licenses/MIT")
            }
        });
        
        // JWT Bearer Authorization
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
        {
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter your token in the text input below.\r\n\r\nExample: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
        });
        
        c.AddSecurityRequirement(new OpenApiSecurityRequirement 
        {
            {
                new OpenApiSecurityScheme 
                {
                    Reference = new OpenApiReference 
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] {}
            }
        });
        
        // Enable annotations for better documentation
        c.EnableAnnotations();
        
        // Custom schema IDs to avoid conflicts
        c.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
        
        // Add XML comments if available
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (System.IO.File.Exists(xmlPath))
        {
            c.IncludeXmlComments(xmlPath);
        }
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
    // Enable static files for custom Swagger UI assets
    app.UseStaticFiles();
    
    // Enable Swagger in all environments for now (can be restricted later)
    app.UseSwagger(c =>
    {
        c.SerializeAsV2 = true;
    });
    
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Chronoughts API v1.0.0");
        c.RoutePrefix = "swagger"; // Swagger UI at /swagger
        c.DocumentTitle = "Chronoughts API Documentation";
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
        c.DefaultModelsExpandDepth(2);
        c.DefaultModelRendering(Swashbuckle.AspNetCore.SwaggerUI.ModelRendering.Model);
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
        c.ShowCommonExtensions();
        c.EnableValidator();
        c.EnableTryItOutByDefault();
        
        // Add custom CSS for better styling
        c.InjectStylesheet("/swagger-ui/custom.css");
        
        // Add custom JavaScript if needed
        c.InjectJavascript("/swagger-ui/custom.js");
    });

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
    
    // JWT Middleware für Token-Verarbeitung
    app.UseMiddleware<Chronoughts.Api.Middleware.JwtMiddleware>();
    
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapAuthEndpoints();
    app.MapThoughtEndpoints();
    app.MapThoughtConnectionEndpoints();

    app.MapHealthChecks("/health");

    app.Run();
}



