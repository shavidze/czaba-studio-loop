# 03 - Hangfire Setup

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 0 (Foundation) |
| **Depends On** | - (არაფერი) |
| **Blocks** | 10 (IG polling), 13 (orchestrator) |
| **Project** | `backend` |
| **Est. Hours** | 3h |
| **Status** | `pending` |

## აღწერა

Hangfire background job system-ის setup: NuGet packages, MSSQL storage, dashboard, queues.

## რა უნდა გაკეთდეს

### 1. NuGet Packages

```xml
<PackageReference Include="Hangfire.Core" Version="1.8.*" />
<PackageReference Include="Hangfire.SqlServer" Version="1.8.*" />
<PackageReference Include="Hangfire.AspNetCore" Version="1.8.*" />
```

### 2. Program.cs Configuration

```csharp
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString, new SqlServerStorageOptions
    {
        CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
        QueuePollInterval = TimeSpan.FromSeconds(15),
        SchemaName = "social"
    }));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 4;
    options.Queues = new[] { "social-publish", "social-analytics", "default" };
});
```

### 3. Dashboard with Admin Auth

```csharp
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new AdminAuthFilter() }
});
```

`AdminAuthFilter` - JWT token-ით admin role-ის შემოწმება.

### 4. Recurring Jobs Registration

ცარიელი placeholder-ები (implementation მოგვიანებით):

```csharp
RecurringJob.AddOrUpdate<TokenRefreshJob>(
    "refresh-social-tokens",
    job => job.RefreshExpiringTokens(CancellationToken.None),
    Cron.Daily(3, 0));

RecurringJob.AddOrUpdate<AnalyticsSyncJob>(
    "sync-social-analytics",
    job => job.SyncAll(CancellationToken.None),
    Cron.Hourly);

RecurringJob.AddOrUpdate<ScheduledPostProcessor>(
    "process-scheduled-posts",
    job => job.ProcessPendingPosts(CancellationToken.None),
    "*/5 * * * *");
```

## ვერიფიკაცია

- [ ] Hangfire dashboard ხელმისაწვდომია `/hangfire`-ზე
- [ ] Admin auth filter მუშაობს (non-admin-ს არ უშვებს)
- [ ] MSSQL-ში `social` schema-ში Hangfire tables შეიქმნა
- [ ] 3 recurring job registered არის dashboard-ზე
