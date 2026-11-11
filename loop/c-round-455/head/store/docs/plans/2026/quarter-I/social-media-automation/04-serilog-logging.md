# 04 - Structured Logging (Serilog)

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 0 (Foundation) |
| **Depends On** | - (არაფერი) |
| **Blocks** | - (არავინ, მაგრამ ყველა service-ს გამოიყენებს) |
| **Project** | `backend` |
| **Est. Hours** | 2h |
| **Status** | `pending` |

## აღწერა

Serilog structured logging Social module-ისთვის: console + MSSQL sink, correlation IDs.

## რა უნდა გაკეთდეს

### 1. NuGet Packages

```xml
<PackageReference Include="Serilog.AspNetCore" Version="8.*" />
<PackageReference Include="Serilog.Sinks.MSSqlServer" Version="6.*" />
```

### 2. Program.cs

```csharp
builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Czaba.Social")
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.MSSqlServer(connectionString, new MSSqlServerSinkOptions
    {
        TableName = "SocialLogs",
        SchemaName = "social",
        AutoCreateSqlTable = true
    }));
```

### 3. Per-Publish Logging Scope Pattern

```csharp
using var scope = _logger.BeginScope(new Dictionary<string, object>
{
    ["CorrelationId"] = correlationId,
    ["PostId"] = postId,
    ["Platform"] = platform,
    ["Operation"] = "SocialPublish"
});
```

სხვა service-ებს ეს pattern-ს მისცემ reference-ად.

## ვერიფიკაცია

- [ ] Console output-ში CorrelationId ჩანს
- [ ] MSSQL-ში `social.SocialLogs` ცხრილი შეიქმნა
- [ ] Log levels სწორად მუშაობს (Information, Warning, Error)
