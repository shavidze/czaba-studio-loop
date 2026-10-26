# Email Management System (Custom SMTP)

## Epic: საკუთარი Email ინფრასტრუქტურის შექმნა

**As a** CZABA-ს ადმინისტრატორი,
**I want to** გვქონდეს სრულად კონტროლირებადი email სისტემა მზა გადაწყვეტილებების (SendGrid, Mailgun, Brevo) გარეშე,
**So that** შევძლოთ email-ების სრული კონტროლი, ხარჯების შემცირება და დამოუკიდებლობა მესამე მხარის სერვისებისგან.

---

## მიმოხილვა

ეს epic მოიცავს სრული email მართვის სისტემის შექმნას, რომელიც იყენებს პირდაპირ SMTP პროტოკოლს და არ არის დამოკიდებული მზა სერვისებზე (SendGrid, Mailgun, Brevo და ა.შ.).

### რატომ საკუთარი გადაწყვეტილება?

| კრიტერიუმი | მზა სერვისი (Brevo) | საკუთარი SMTP |
|------------|---------------------|---------------|
| **ხარჯი (10k/თვე)** | $25+ | $0-5 (VPS/სერვერი) |
| **კონტროლი** | შეზღუდული | სრული |
| **Template-ები** | მათ პლატფორმაზე | ჩვენს DB-ში |
| **Analytics** | მათი დაშბორდი | ჩვენი დაშბორდი |
| **Deliverability** | მათზეა დამოკიდებული | ჩვენ ვმართავთ |
| **Data Ownership** | მათ სერვერებზე | ჩვენს სერვერზე |

---

## არქიტექტურის მიმოხილვა

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EMAIL MANAGEMENT SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   Admin Panel    │
                         │  (React Admin)   │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │ Templates │ │ Campaigns │ │ Analytics │
            │    UI     │ │    UI     │ │    UI     │
            └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                  │             │             │
                  └─────────────┼─────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    .NET Backend API   │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │  Email Service  │  │
                    │  └────────┬────────┘  │
                    │           │           │
                    │  ┌────────┴────────┐  │
                    │  │                 │  │
                    │  ▼                 ▼  │
                    │ ┌────┐       ┌──────┐ │
                    │ │Queue│      │Sender│ │
                    │ │(DB) │──────│Worker│ │
                    │ └────┘       └──┬───┘ │
                    │                 │     │
                    └─────────────────┼─────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  SMTP Server  │
                              │  (Mail Host)  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   Recipients  │
                              └───────────────┘
```

---

# ნაწილი 1: Email Sending Infrastructure

## 1.1 SMTP კონფიგურაცია

### User Story

**As a** სისტემის ადმინისტრატორი,
**I want to** დავაკონფიგურირო SMTP სერვერის პარამეტრები Admin Panel-იდან,
**So that** შევძლო email-ების გაგზავნა სხვადასხვა SMTP პროვაიდერის გამოყენებით.

### მონაცემთა მოდელი

```sql
-- SMTP კონფიგურაცია
CREATE TABLE EmailSmtpConfig (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100) NOT NULL,              -- "Primary", "Backup"
    Host NVARCHAR(255) NOT NULL,              -- smtp.example.com
    Port INT NOT NULL DEFAULT 587,            -- 25, 465, 587
    Username NVARCHAR(255) NULL,
    PasswordEncrypted NVARCHAR(500) NULL,     -- AES-256 encrypted
    UseSsl BIT NOT NULL DEFAULT 1,
    FromEmail NVARCHAR(255) NOT NULL,         -- noreply@czaba.store
    FromName NVARCHAR(100) NOT NULL,          -- "CZABA Store"
    IsActive BIT NOT NULL DEFAULT 1,
    Priority INT NOT NULL DEFAULT 1,          -- Failover order
    DailyLimit INT NULL,                      -- Rate limit
    CurrentDailyCount INT DEFAULT 0,
    LastResetDate DATE DEFAULT GETUTCDATE(),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- მაგალითი
INSERT INTO EmailSmtpConfig (Name, Host, Port, Username, FromEmail, FromName, Priority)
VALUES
    ('Primary', 'mail.czaba.store', 587, 'noreply@czaba.store', 'noreply@czaba.store', 'CZABA Store', 1),
    ('Backup', 'smtp.backup.com', 587, 'backup@czaba.store', 'noreply@czaba.store', 'CZABA Store', 2);
```

### API Endpoints

```
GET    /api/admin/email/smtp-configs         -- ყველა SMTP კონფიგურაცია
GET    /api/admin/email/smtp-configs/{id}    -- კონკრეტული კონფიგურაცია
POST   /api/admin/email/smtp-configs         -- ახალი კონფიგურაციის დამატება
PUT    /api/admin/email/smtp-configs/{id}    -- კონფიგურაციის განახლება
DELETE /api/admin/email/smtp-configs/{id}    -- კონფიგურაციის წაშლა
POST   /api/admin/email/smtp-configs/{id}/test -- ტესტ email-ის გაგზავნა
```

### C# Interface

```csharp
public interface ISmtpConfigService
{
    Task<List<SmtpConfigResponse>> GetAllAsync(CancellationToken ct = default);
    Task<SmtpConfigResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<SmtpConfigResponse> CreateAsync(CreateSmtpConfigRequest request, CancellationToken ct = default);
    Task<SmtpConfigResponse> UpdateAsync(int id, UpdateSmtpConfigRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
    Task<EmailResult> TestConnectionAsync(int id, string testEmail, CancellationToken ct = default);
    Task<SmtpConfigResponse?> GetActiveConfigAsync(CancellationToken ct = default);
}

public class SmtpConfigResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool UseSsl { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int Priority { get; set; }
    public int? DailyLimit { get; set; }
    public int CurrentDailyCount { get; set; }
}
```

---

## 1.2 Email Queue System

### User Story

**As a** სისტემა,
**I want to** email-ები რიგში ჩავწერო და ასინქრონულად გავაგზავნო,
**So that** API response-ი არ დაელოდოს email-ის გაგზავნას და სისტემა იყოს მდგრადი.

### მონაცემთა მოდელი

```sql
-- Email Queue
CREATE TABLE EmailQueue (
    Id BIGINT PRIMARY KEY IDENTITY,

    -- Recipient
    ToEmail NVARCHAR(255) NOT NULL,
    ToName NVARCHAR(100) NULL,
    CcEmails NVARCHAR(MAX) NULL,              -- JSON array
    BccEmails NVARCHAR(MAX) NULL,             -- JSON array

    -- Content
    Subject NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    BodyText NVARCHAR(MAX) NULL,

    -- Template reference (optional)
    TemplateId INT NULL FOREIGN KEY REFERENCES EmailTemplate(Id),
    TemplateData NVARCHAR(MAX) NULL,          -- JSON: template variables

    -- Campaign reference (optional)
    CampaignId INT NULL FOREIGN KEY REFERENCES EmailCampaign(Id),

    -- Status
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',  -- Pending, Processing, Sent, Failed, Cancelled
    Priority INT NOT NULL DEFAULT 5,          -- 1=highest, 10=lowest

    -- Scheduling
    ScheduledAt DATETIME2 NULL,               -- NULL = send immediately
    ProcessingStartedAt DATETIME2 NULL,
    SentAt DATETIME2 NULL,

    -- Retry mechanism
    RetryCount INT NOT NULL DEFAULT 0,
    MaxRetries INT NOT NULL DEFAULT 3,
    LastError NVARCHAR(MAX) NULL,
    NextRetryAt DATETIME2 NULL,

    -- Tracking
    SmtpConfigId INT NULL,                    -- Which SMTP was used
    MessageId NVARCHAR(255) NULL,             -- SMTP Message-ID header

    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),

    -- Indexes
    INDEX IX_EmailQueue_Status_ScheduledAt (Status, ScheduledAt),
    INDEX IX_EmailQueue_CampaignId (CampaignId),
    INDEX IX_EmailQueue_ToEmail (ToEmail)
);

-- Queue Status History (for debugging)
CREATE TABLE EmailQueueStatusHistory (
    Id BIGINT PRIMARY KEY IDENTITY,
    QueueId BIGINT NOT NULL FOREIGN KEY REFERENCES EmailQueue(Id),
    OldStatus NVARCHAR(20) NOT NULL,
    NewStatus NVARCHAR(20) NOT NULL,
    Error NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### Queue Processing States

```
┌─────────┐     ┌────────────┐     ┌──────┐
│ Pending │────>│ Processing │────>│ Sent │
└─────────┘     └────────────┘     └──────┘
                      │
                      │ (Error)
                      ▼
                ┌──────────┐
                │  Failed  │
                └────┬─────┘
                     │
         ┌───────────┴───────────┐
         │ RetryCount < MaxRetries│
         │           │            │
         ▼           │            ▼
    ┌─────────┐      │      ┌───────────┐
    │ Pending │◄─────┘      │ Permanent │
    │(NextRetry)            │  Failure  │
    └─────────┘             └───────────┘
```

### C# Services

```csharp
public interface IEmailQueueService
{
    // Enqueue
    Task<long> EnqueueAsync(EnqueueEmailRequest request, CancellationToken ct = default);
    Task<List<long>> EnqueueBatchAsync(List<EnqueueEmailRequest> requests, CancellationToken ct = default);

    // Queue management
    Task<PagedResult<EmailQueueResponse>> GetQueueAsync(EmailQueueFilter filter, CancellationToken ct = default);
    Task<EmailQueueResponse?> GetByIdAsync(long id, CancellationToken ct = default);
    Task CancelAsync(long id, CancellationToken ct = default);
    Task RetryAsync(long id, CancellationToken ct = default);

    // Statistics
    Task<EmailQueueStats> GetStatsAsync(CancellationToken ct = default);
}

public class EnqueueEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string? ToName { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string? BodyText { get; set; }
    public int? TemplateId { get; set; }
    public Dictionary<string, object>? TemplateData { get; set; }
    public int? CampaignId { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public int Priority { get; set; } = 5;
}

public class EmailQueueStats
{
    public int Pending { get; set; }
    public int Processing { get; set; }
    public int SentToday { get; set; }
    public int FailedToday { get; set; }
    public int ScheduledFuture { get; set; }
}
```

### Background Worker

```csharp
public class EmailSenderWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailSenderWorker> _logger;
    private readonly int _batchSize = 10;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<IEmailQueueProcessor>();

            var processed = await processor.ProcessBatchAsync(_batchSize, stoppingToken);

            if (processed == 0)
            {
                await Task.Delay(_pollingInterval, stoppingToken);
            }
        }
    }
}

public interface IEmailQueueProcessor
{
    Task<int> ProcessBatchAsync(int batchSize, CancellationToken ct = default);
}
```

---

## 1.3 Retry Mechanism

### User Story

**As a** სისტემა,
**I want to** წარუმატებელი email-ები ავტომატურად ხელახლა გავაგზავნო,
**So that** დროებითი შეცდომების დროს email-ები არ დაიკარგოს.

### Retry Strategy: Exponential Backoff

```csharp
public class RetryPolicy
{
    public int MaxRetries { get; set; } = 3;
    public TimeSpan BaseDelay { get; set; } = TimeSpan.FromMinutes(1);
    public double BackoffMultiplier { get; set; } = 2.0;

    public DateTime? GetNextRetryTime(int currentRetryCount)
    {
        if (currentRetryCount >= MaxRetries)
            return null;

        var delay = BaseDelay * Math.Pow(BackoffMultiplier, currentRetryCount);
        return DateTime.UtcNow.Add(delay);
    }
}

// Retry Schedule Example:
// Attempt 1: Immediate
// Attempt 2: +1 minute
// Attempt 3: +2 minutes
// Attempt 4: +4 minutes
// After Attempt 4: Permanent Failure
```

### Error Classification

```csharp
public enum EmailErrorType
{
    // Retryable Errors
    TemporaryFailure,       // SMTP timeout, connection refused
    RateLimited,            // Too many requests
    ServerBusy,             // SMTP 421 - Try again later

    // Permanent Errors (Don't Retry)
    InvalidRecipient,       // Email doesn't exist
    AuthenticationFailed,   // Wrong SMTP credentials
    BlacklistedDomain,      // Domain blocked
    ContentRejected,        // Spam filter
    InvalidConfiguration    // Wrong SMTP settings
}

public class EmailErrorClassifier
{
    public static EmailErrorType Classify(Exception ex, string smtpResponse)
    {
        // SMTP Response codes
        if (smtpResponse.StartsWith("421")) return EmailErrorType.ServerBusy;
        if (smtpResponse.StartsWith("450")) return EmailErrorType.TemporaryFailure;
        if (smtpResponse.StartsWith("451")) return EmailErrorType.TemporaryFailure;
        if (smtpResponse.StartsWith("452")) return EmailErrorType.RateLimited;

        if (smtpResponse.StartsWith("550")) return EmailErrorType.InvalidRecipient;
        if (smtpResponse.StartsWith("551")) return EmailErrorType.InvalidRecipient;
        if (smtpResponse.StartsWith("552")) return EmailErrorType.ContentRejected;
        if (smtpResponse.StartsWith("553")) return EmailErrorType.InvalidRecipient;
        if (smtpResponse.StartsWith("554")) return EmailErrorType.BlacklistedDomain;

        if (smtpResponse.StartsWith("535")) return EmailErrorType.AuthenticationFailed;

        // Exception-based
        if (ex is SocketException) return EmailErrorType.TemporaryFailure;
        if (ex is TimeoutException) return EmailErrorType.TemporaryFailure;

        return EmailErrorType.TemporaryFailure; // Default: retry
    }

    public static bool IsRetryable(EmailErrorType errorType)
    {
        return errorType switch
        {
            EmailErrorType.TemporaryFailure => true,
            EmailErrorType.RateLimited => true,
            EmailErrorType.ServerBusy => true,
            _ => false
        };
    }
}
```

---

## 1.4 Rate Limiting

### User Story

**As a** სისტემის ადმინისტრატორი,
**I want to** შევზღუდო email-ების გაგზავნის სიჩქარე,
**So that** არ დავიბლოკოთ SMTP პროვაიდერის მიერ და შევინარჩუნოთ კარგი sender reputation.

### Rate Limiting Configuration

```sql
-- Global Rate Limits
CREATE TABLE EmailRateLimit (
    Id INT PRIMARY KEY IDENTITY,
    LimitType NVARCHAR(50) NOT NULL,          -- 'PerSecond', 'PerMinute', 'PerHour', 'PerDay'
    MaxCount INT NOT NULL,
    CurrentCount INT DEFAULT 0,
    WindowStartAt DATETIME2 DEFAULT GETUTCDATE(),

    UNIQUE (LimitType)
);

-- Default values
INSERT INTO EmailRateLimit (LimitType, MaxCount) VALUES
    ('PerSecond', 5),
    ('PerMinute', 100),
    ('PerHour', 1000),
    ('PerDay', 10000);
```

### Rate Limiter Service

```csharp
public interface IRateLimiter
{
    Task<bool> TryAcquireAsync(string resource, CancellationToken ct = default);
    Task<RateLimitStatus> GetStatusAsync(CancellationToken ct = default);
}

public class SlidingWindowRateLimiter : IRateLimiter
{
    private readonly IEmailRateLimitRepository _repository;

    public async Task<bool> TryAcquireAsync(string resource, CancellationToken ct = default)
    {
        var limits = await _repository.GetAllAsync(ct);

        foreach (var limit in limits)
        {
            var windowDuration = GetWindowDuration(limit.LimitType);

            if (DateTime.UtcNow - limit.WindowStartAt > windowDuration)
            {
                await _repository.ResetWindowAsync(limit.Id, ct);
            }

            if (limit.CurrentCount >= limit.MaxCount)
            {
                return false; // Rate limit exceeded
            }
        }

        await _repository.IncrementAllAsync(ct);
        return true;
    }

    private TimeSpan GetWindowDuration(string limitType) => limitType switch
    {
        "PerSecond" => TimeSpan.FromSeconds(1),
        "PerMinute" => TimeSpan.FromMinutes(1),
        "PerHour" => TimeSpan.FromHours(1),
        "PerDay" => TimeSpan.FromDays(1),
        _ => TimeSpan.FromMinutes(1)
    };
}

public class RateLimitStatus
{
    public int PerSecondRemaining { get; set; }
    public int PerMinuteRemaining { get; set; }
    public int PerHourRemaining { get; set; }
    public int PerDayRemaining { get; set; }
    public DateTime NextResetAt { get; set; }
}
```

---

# ნაწილი 2: Email Templates Management

## 2.1 Template Storage

### User Story

**As a** ადმინისტრატორი,
**I want to** შევქმნა და ვმართო email template-ები მონაცემთა ბაზაში,
**So that** მარტივად შევცვალო email-ების შინაარსი კოდის შეცვლის გარეშე.

### მონაცემთა მოდელი

```sql
-- Email Templates
CREATE TABLE EmailTemplate (
    Id INT PRIMARY KEY IDENTITY,

    -- Identification
    Code NVARCHAR(50) NOT NULL UNIQUE,        -- 'ORDER_CONFIRMATION', 'PASSWORD_RESET'
    Name NVARCHAR(100) NOT NULL,              -- "შეკვეთის დადასტურება"
    Description NVARCHAR(500) NULL,
    Category NVARCHAR(50) NOT NULL,           -- 'Transactional', 'Marketing', 'System'

    -- Content
    Subject NVARCHAR(500) NOT NULL,           -- Subject with {{placeholders}}
    BodyHtml NVARCHAR(MAX) NOT NULL,          -- HTML template
    BodyText NVARCHAR(MAX) NULL,              -- Plain text fallback

    -- Preview
    PreviewText NVARCHAR(200) NULL,           -- Email preview text

    -- Settings
    IsActive BIT NOT NULL DEFAULT 1,
    IsSystem BIT NOT NULL DEFAULT 0,          -- Cannot be deleted

    -- Versioning
    Version INT NOT NULL DEFAULT 1,

    -- Timestamps
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CreatedBy INT NULL FOREIGN KEY REFERENCES [User](Id),
    UpdatedBy INT NULL FOREIGN KEY REFERENCES [User](Id)
);

-- Template Variables Definition
CREATE TABLE EmailTemplateVariable (
    Id INT PRIMARY KEY IDENTITY,
    TemplateId INT NOT NULL FOREIGN KEY REFERENCES EmailTemplate(Id) ON DELETE CASCADE,
    Name NVARCHAR(50) NOT NULL,               -- 'customerName'
    Description NVARCHAR(200) NULL,           -- "მომხმარებლის სახელი"
    DataType NVARCHAR(20) NOT NULL,           -- 'string', 'number', 'date', 'array', 'boolean'
    IsRequired BIT NOT NULL DEFAULT 1,
    DefaultValue NVARCHAR(500) NULL,
    SampleValue NVARCHAR(500) NULL,           -- For preview

    UNIQUE (TemplateId, Name)
);

-- Template Version History
CREATE TABLE EmailTemplateHistory (
    Id INT PRIMARY KEY IDENTITY,
    TemplateId INT NOT NULL FOREIGN KEY REFERENCES EmailTemplate(Id),
    Version INT NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    BodyText NVARCHAR(MAX) NULL,
    ChangedAt DATETIME2 DEFAULT GETUTCDATE(),
    ChangedBy INT NULL FOREIGN KEY REFERENCES [User](Id),
    ChangeReason NVARCHAR(500) NULL
);
```

### System Templates (Initial Seed)

```sql
-- Transactional Templates
INSERT INTO EmailTemplate (Code, Name, Category, Subject, BodyHtml, IsSystem) VALUES
('ORDER_CONFIRMATION', 'შეკვეთის დადასტურება', 'Transactional',
 'შეკვეთა #{{orderNumber}} შეიქმნა', '<html>...</html>', 1),

('PAYMENT_SUCCESS', 'გადახდის დადასტურება', 'Transactional',
 'გადახდა წარმატებით დასრულდა!', '<html>...</html>', 1),

('DOWNLOAD_READY', 'ჩამოტვირთვა მზადაა', 'Transactional',
 'თქვენი პროდუქტები მზადაა გადმოსაწერად', '<html>...</html>', 1),

('WELCOME', 'მისასალმებელი Email', 'Transactional',
 'კეთილი იყოს თქვენი მობრძანება CZABA-ში!', '<html>...</html>', 1),

('PASSWORD_RESET', 'პაროლის აღდგენა', 'Transactional',
 'პაროლის აღდგენის მოთხოვნა', '<html>...</html>', 1),

('GIFT_CARD_PURCHASE', 'სასაჩუქრე ბარათი', 'Transactional',
 'თქვენი სასაჩუქრე ბარათი მზადაა!', '<html>...</html>', 1),

('CHAT_OFFLINE_NOTIFICATION', 'ჩათის შეტყობინება', 'System',
 'ახალი შეტყობინება CZABA-დან', '<html>...</html>', 1);

-- Variables for ORDER_CONFIRMATION
INSERT INTO EmailTemplateVariable (TemplateId, Name, Description, DataType, IsRequired, SampleValue) VALUES
(1, 'customerName', 'მომხმარებლის სახელი', 'string', 1, 'გიორგი'),
(1, 'orderNumber', 'შეკვეთის ნომერი', 'string', 1, 'CZ-20240120-ABC123'),
(1, 'totalAmount', 'ჯამური თანხა', 'string', 1, '$99.99'),
(1, 'items', 'პროდუქტების სია', 'array', 1, '[{"title":"Pack 1","price":"$49.99"}]'),
(1, 'orderDate', 'შეკვეთის თარიღი', 'string', 1, 'January 20, 2024');
```

---

## 2.2 Template Variables/Placeholders

### Placeholder Syntax

```
{{variableName}}                    -- Simple variable
{{#if condition}}...{{/if}}         -- Conditional
{{#each items}}...{{/each}}         -- Loop
{{formatCurrency amount}}            -- Helper function
{{formatDate date "MMMM dd, yyyy"}} -- Date formatting
```

### Template Engine Implementation

```csharp
public interface ITemplateEngine
{
    string Render(string template, Dictionary<string, object> data);
    Task<string> RenderTemplateAsync(string templateCode, Dictionary<string, object> data, CancellationToken ct = default);
    ValidationResult ValidateTemplate(string template);
    List<string> ExtractVariables(string template);
}

public class HandlebarsTemplateEngine : ITemplateEngine
{
    private readonly IEmailTemplateRepository _templateRepository;

    public string Render(string template, Dictionary<string, object> data)
    {
        var compiledTemplate = Handlebars.Compile(template);
        return compiledTemplate(data);
    }

    public async Task<string> RenderTemplateAsync(string templateCode, Dictionary<string, object> data, CancellationToken ct = default)
    {
        var template = await _templateRepository.GetByCodeAsync(templateCode, ct);
        if (template == null)
            throw new NotFoundException($"Template '{templateCode}' not found");

        return Render(template.BodyHtml, data);
    }

    public List<string> ExtractVariables(string template)
    {
        var regex = new Regex(@"\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}");
        var matches = regex.Matches(template);
        return matches.Select(m => m.Groups[1].Value).Distinct().ToList();
    }
}

// Register custom helpers
Handlebars.RegisterHelper("formatCurrency", (writer, context, parameters) => {
    if (parameters.Length > 0 && decimal.TryParse(parameters[0].ToString(), out var amount))
    {
        writer.WriteSafeString(amount.ToString("C"));
    }
});

Handlebars.RegisterHelper("formatDate", (writer, context, parameters) => {
    if (parameters.Length > 0 && DateTime.TryParse(parameters[0].ToString(), out var date))
    {
        var format = parameters.Length > 1 ? parameters[1].ToString() : "MMMM dd, yyyy";
        writer.WriteSafeString(date.ToString(format));
    }
});
```

---

## 2.3 Template CRUD via Admin Panel

### API Endpoints

```
GET    /api/admin/email/templates                  -- ყველა template
GET    /api/admin/email/templates/{id}             -- კონკრეტული template
GET    /api/admin/email/templates/code/{code}      -- კოდით მოძიება
POST   /api/admin/email/templates                  -- ახალი template
PUT    /api/admin/email/templates/{id}             -- განახლება
DELETE /api/admin/email/templates/{id}             -- წაშლა (if not system)
POST   /api/admin/email/templates/{id}/duplicate   -- დუბლიკატის შექმნა
GET    /api/admin/email/templates/{id}/history     -- ვერსიების ისტორია
POST   /api/admin/email/templates/{id}/revert/{version} -- წინა ვერსიაზე დაბრუნება
```

### DTOs

```csharp
public class EmailTemplateResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string? BodyText { get; set; }
    public string? PreviewText { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystem { get; set; }
    public int Version { get; set; }
    public List<TemplateVariableResponse> Variables { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateEmailTemplateRequest
{
    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public string Category { get; set; } = "Transactional";

    [Required, MaxLength(500)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string BodyHtml { get; set; } = string.Empty;

    public string? BodyText { get; set; }

    [MaxLength(200)]
    public string? PreviewText { get; set; }

    public List<CreateTemplateVariableRequest> Variables { get; set; } = new();
}

public class CreateTemplateVariableRequest
{
    [Required, MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }

    [Required]
    public string DataType { get; set; } = "string";

    public bool IsRequired { get; set; } = true;
    public string? DefaultValue { get; set; }
    public string? SampleValue { get; set; }
}
```

---

## 2.4 Preview Functionality

### User Story

**As a** ადმინისტრატორი,
**I want to** ვნახო template-ის preview სანამ შევინახავ,
**So that** დავრწმუნდე რომ email სწორად გამოიყურება.

### API Endpoints

```
POST   /api/admin/email/templates/preview          -- Preview raw template
POST   /api/admin/email/templates/{id}/preview     -- Preview saved template
POST   /api/admin/email/templates/{id}/send-test   -- Send test email
```

### Preview Request/Response

```csharp
public class TemplatePreviewRequest
{
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public Dictionary<string, object> SampleData { get; set; } = new();
}

public class TemplatePreviewResponse
{
    public string RenderedSubject { get; set; } = string.Empty;
    public string RenderedHtml { get; set; } = string.Empty;
    public string? RenderedText { get; set; }
    public List<string> Warnings { get; set; } = new();  // Missing variables, etc.
    public bool IsValid { get; set; }
}

public class SendTestEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public Dictionary<string, object>? OverrideData { get; set; }
}
```

---

# ნაწილი 3: Email Campaigns

## 3.1 Campaign Creation

### User Story

**As a** მარკეტერი/ადმინისტრატორი,
**I want to** შევქმნა email კამპანიები მრავალი მიმღებისთვის,
**So that** ერთდროულად გავაგზავნო მარკეტინგული ან საინფორმაციო შეტყობინებები.

### მონაცემთა მოდელი

```sql
-- Email Campaigns
CREATE TABLE EmailCampaign (
    Id INT PRIMARY KEY IDENTITY,

    -- Basic Info
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,

    -- Content
    TemplateId INT NOT NULL FOREIGN KEY REFERENCES EmailTemplate(Id),
    Subject NVARCHAR(500) NOT NULL,           -- Can override template subject
    TemplateData NVARCHAR(MAX) NULL,          -- JSON: global variables

    -- Recipient Source
    RecipientSourceType NVARCHAR(50) NOT NULL, -- 'Segment', 'List', 'Manual', 'AllUsers'
    RecipientSegmentId INT NULL FOREIGN KEY REFERENCES EmailSegment(Id),
    RecipientListData NVARCHAR(MAX) NULL,     -- JSON array for manual lists

    -- Status & Scheduling
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Scheduled, Sending, Sent, Paused, Cancelled
    ScheduledAt DATETIME2 NULL,
    StartedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,

    -- Statistics (updated in real-time)
    TotalRecipients INT DEFAULT 0,
    SentCount INT DEFAULT 0,
    FailedCount INT DEFAULT 0,

    -- Settings
    SendRate INT NULL,                        -- Emails per minute (throttling)

    -- Timestamps
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CreatedBy INT NULL FOREIGN KEY REFERENCES [User](Id)
);

-- Campaign Recipients (for tracking individual sends)
CREATE TABLE EmailCampaignRecipient (
    Id BIGINT PRIMARY KEY IDENTITY,
    CampaignId INT NOT NULL FOREIGN KEY REFERENCES EmailCampaign(Id),
    Email NVARCHAR(255) NOT NULL,
    Name NVARCHAR(100) NULL,
    UserId INT NULL FOREIGN KEY REFERENCES [User](Id),

    -- Custom data for this recipient
    PersonalizedData NVARCHAR(MAX) NULL,      -- JSON

    -- Status
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Sent, Failed, Bounced
    SentAt DATETIME2 NULL,
    Error NVARCHAR(500) NULL,

    -- Tracking
    QueueId BIGINT NULL FOREIGN KEY REFERENCES EmailQueue(Id),

    INDEX IX_CampaignRecipient_CampaignId (CampaignId),
    INDEX IX_CampaignRecipient_Status (Status)
);
```

### API Endpoints

```
GET    /api/admin/email/campaigns                  -- ყველა კამპანია
GET    /api/admin/email/campaigns/{id}             -- კონკრეტული კამპანია
POST   /api/admin/email/campaigns                  -- ახალი კამპანია
PUT    /api/admin/email/campaigns/{id}             -- განახლება
DELETE /api/admin/email/campaigns/{id}             -- წაშლა
POST   /api/admin/email/campaigns/{id}/schedule    -- დაგეგმვა
POST   /api/admin/email/campaigns/{id}/send-now    -- დაუყოვნებლივ გაგზავნა
POST   /api/admin/email/campaigns/{id}/pause       -- პაუზა
POST   /api/admin/email/campaigns/{id}/resume      -- გაგრძელება
POST   /api/admin/email/campaigns/{id}/cancel      -- გაუქმება
GET    /api/admin/email/campaigns/{id}/recipients  -- მიმღებების სია
GET    /api/admin/email/campaigns/{id}/stats       -- სტატისტიკა
```

---

## 3.2 Recipient Lists/Segments

### User Story

**As a** ადმინისტრატორი,
**I want to** შევქმნა მომხმარებელთა სეგმენტები სხვადასხვა კრიტერიუმით,
**So that** მიზანმიმართული კამპანიები გავაგზავნო.

### მონაცემთა მოდელი

```sql
-- User Segments
CREATE TABLE EmailSegment (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,

    -- Filter criteria (JSON)
    FilterCriteria NVARCHAR(MAX) NOT NULL,

    -- Calculated count (cached)
    EstimatedCount INT DEFAULT 0,
    LastCalculatedAt DATETIME2 NULL,

    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Example FilterCriteria JSON:
-- {
--   "conditions": [
--     { "field": "HasPurchased", "operator": "equals", "value": true },
--     { "field": "LastPurchaseDate", "operator": "greaterThan", "value": "2024-01-01" },
--     { "field": "TotalSpent", "operator": "greaterThan", "value": 100 }
--   ],
--   "logic": "AND"
-- }
```

### Predefined Segments

```csharp
public static class PredefinedSegments
{
    public static readonly List<SegmentDefinition> All = new()
    {
        new("all_users", "ყველა მომხმარებელი", new { }), // No filter

        new("buyers", "მყიდველები", new {
            conditions = new[] {
                new { field = "HasPurchased", @operator = "equals", value = true }
            }
        }),

        new("non_buyers", "არამყიდველები", new {
            conditions = new[] {
                new { field = "HasPurchased", @operator = "equals", value = false }
            }
        }),

        new("inactive_30_days", "არააქტიური 30+ დღე", new {
            conditions = new[] {
                new { field = "LastActivityDate", @operator = "lessThan", value = DateTime.UtcNow.AddDays(-30) }
            }
        }),

        new("high_value", "მაღალი ღირებულების კლიენტები", new {
            conditions = new[] {
                new { field = "TotalSpent", @operator = "greaterThan", value = 500 }
            }
        })
    };
}
```

### Segment Service

```csharp
public interface IEmailSegmentService
{
    Task<List<EmailSegmentResponse>> GetAllAsync(CancellationToken ct = default);
    Task<EmailSegmentResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EmailSegmentResponse> CreateAsync(CreateSegmentRequest request, CancellationToken ct = default);
    Task<EmailSegmentResponse> UpdateAsync(int id, UpdateSegmentRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
    Task<int> CalculateCountAsync(int id, CancellationToken ct = default);
    Task<List<SegmentUserResponse>> GetUsersAsync(int id, int skip = 0, int take = 100, CancellationToken ct = default);
}
```

---

## 3.3 Scheduling

### User Story

**As a** ადმინისტრატორი,
**I want to** კამპანიები დავგეგმო კონკრეტული დროისთვის,
**So that** email-ები გაიგზავნოს მომხმარებლისთვის ოპტიმალურ დროს.

### Scheduling Options

```csharp
public class CampaignScheduleRequest
{
    public DateTime ScheduledAt { get; set; }

    // Optional: Time zone consideration
    public string? TimeZone { get; set; }  // "Asia/Tbilisi"

    // Optional: Send over time (drip)
    public int? SendOverHours { get; set; }  // Spread sends over N hours
}

// Campaign Scheduler Background Service
public class CampaignSchedulerWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();
            var campaignService = scope.ServiceProvider.GetRequiredService<ICampaignService>();

            // Find campaigns ready to start
            var campaigns = await campaignService.GetScheduledCampaignsAsync(stoppingToken);

            foreach (var campaign in campaigns)
            {
                if (campaign.ScheduledAt <= DateTime.UtcNow)
                {
                    await campaignService.StartCampaignAsync(campaign.Id, stoppingToken);
                }
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

---

## 3.4 Campaign Analytics

### User Story

**As a** ადმინისტრატორი/მარკეტერი,
**I want to** ვნახო კამპანიის დეტალური სტატისტიკა,
**So that** გავზომო კამპანიის ეფექტურობა.

### მონაცემთა მოდელი

```sql
-- Email Tracking Events
CREATE TABLE EmailTrackingEvent (
    Id BIGINT PRIMARY KEY IDENTITY,

    -- Reference
    QueueId BIGINT NULL FOREIGN KEY REFERENCES EmailQueue(Id),
    CampaignId INT NULL FOREIGN KEY REFERENCES EmailCampaign(Id),
    RecipientEmail NVARCHAR(255) NOT NULL,

    -- Event
    EventType NVARCHAR(20) NOT NULL,          -- 'Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Complained', 'Unsubscribed'
    EventData NVARCHAR(MAX) NULL,             -- JSON: click URL, bounce reason, etc.

    -- Context
    IpAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,

    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),

    INDEX IX_EmailTrackingEvent_CampaignId (CampaignId),
    INDEX IX_EmailTrackingEvent_QueueId (QueueId),
    INDEX IX_EmailTrackingEvent_EventType (EventType)
);

-- Aggregated Campaign Stats (updated periodically)
CREATE TABLE EmailCampaignStats (
    CampaignId INT PRIMARY KEY FOREIGN KEY REFERENCES EmailCampaign(Id),

    TotalRecipients INT DEFAULT 0,
    Sent INT DEFAULT 0,
    Delivered INT DEFAULT 0,
    Opened INT DEFAULT 0,
    UniqueOpens INT DEFAULT 0,
    Clicked INT DEFAULT 0,
    UniqueClicks INT DEFAULT 0,
    Bounced INT DEFAULT 0,
    Complained INT DEFAULT 0,
    Unsubscribed INT DEFAULT 0,

    -- Rates (calculated)
    OpenRate DECIMAL(5,2) DEFAULT 0,          -- UniqueOpens / Delivered * 100
    ClickRate DECIMAL(5,2) DEFAULT 0,         -- UniqueClicks / Delivered * 100
    BounceRate DECIMAL(5,2) DEFAULT 0,        -- Bounced / Sent * 100

    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### Tracking Implementation

#### Open Tracking (Tracking Pixel)

```csharp
// Add tracking pixel to email HTML
public string AddOpenTracking(string html, long queueId)
{
    var trackingUrl = $"https://api.czaba.store/email/track/open/{queueId}";
    var pixel = $"<img src=\"{trackingUrl}\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />";

    // Insert before </body>
    return html.Replace("</body>", $"{pixel}</body>");
}

// Tracking endpoint
[HttpGet("track/open/{queueId}")]
public async Task<IActionResult> TrackOpen(long queueId)
{
    await _trackingService.RecordOpenAsync(queueId, Request.Headers.UserAgent, GetIpAddress());

    // Return 1x1 transparent GIF
    var pixel = Convert.FromBase64String("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    return File(pixel, "image/gif");
}
```

#### Click Tracking

```csharp
// Rewrite links in email
public string AddClickTracking(string html, long queueId)
{
    var regex = new Regex(@"href=""(https?://[^""]+)""");

    return regex.Replace(html, match =>
    {
        var originalUrl = match.Groups[1].Value;
        var encodedUrl = WebUtility.UrlEncode(originalUrl);
        var trackingUrl = $"https://api.czaba.store/email/track/click/{queueId}?url={encodedUrl}";
        return $"href=\"{trackingUrl}\"";
    });
}

// Click tracking endpoint
[HttpGet("track/click/{queueId}")]
public async Task<IActionResult> TrackClick(long queueId, [FromQuery] string url)
{
    await _trackingService.RecordClickAsync(queueId, url, Request.Headers.UserAgent, GetIpAddress());

    return Redirect(WebUtility.UrlDecode(url));
}
```

### Campaign Stats Response

```csharp
public class CampaignStatsResponse
{
    public int CampaignId { get; set; }
    public string CampaignName { get; set; } = string.Empty;

    // Counts
    public int TotalRecipients { get; set; }
    public int Sent { get; set; }
    public int Delivered { get; set; }
    public int UniqueOpens { get; set; }
    public int TotalOpens { get; set; }
    public int UniqueClicks { get; set; }
    public int TotalClicks { get; set; }
    public int Bounced { get; set; }
    public int Complained { get; set; }
    public int Unsubscribed { get; set; }

    // Rates
    public decimal DeliveryRate { get; set; }
    public decimal OpenRate { get; set; }
    public decimal ClickRate { get; set; }
    public decimal ClickToOpenRate { get; set; }
    public decimal BounceRate { get; set; }
    public decimal ComplaintRate { get; set; }

    // Timeline
    public List<TimelineDataPoint> OpenTimeline { get; set; } = new();
    public List<TimelineDataPoint> ClickTimeline { get; set; } = new();

    // Top Links
    public List<LinkClickStats> TopLinks { get; set; } = new();
}

public class TimelineDataPoint
{
    public DateTime Time { get; set; }
    public int Count { get; set; }
}

public class LinkClickStats
{
    public string Url { get; set; } = string.Empty;
    public int Clicks { get; set; }
    public int UniqueClicks { get; set; }
}
```

---

# ნაწილი 4: Transactional Emails

## 4.1 Order Confirmation

### Trigger Point

```csharp
// OrderService.cs
public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct)
{
    // ... create order logic ...

    // Send confirmation email
    await _emailService.SendTransactionalAsync(new TransactionalEmailRequest
    {
        TemplateCode = "ORDER_CONFIRMATION",
        ToEmail = order.Email,
        ToName = order.CustomerName,
        Data = new Dictionary<string, object>
        {
            ["customerName"] = order.CustomerName,
            ["orderNumber"] = order.OrderNumber,
            ["totalAmount"] = order.Total,
            ["items"] = order.Items.Select(i => new {
                title = i.ProductTitle,
                licenseType = i.LicenseType,
                price = i.Price,
                quantity = i.Quantity
            }),
            ["orderDate"] = order.CreatedAt.ToString("MMMM dd, yyyy")
        },
        Priority = 1 // High priority
    }, ct);

    return order;
}
```

---

## 4.2 Password Reset

### Trigger Point

```csharp
// AuthService.cs
public async Task<bool> RequestPasswordResetAsync(string email, CancellationToken ct)
{
    var user = await _userRepository.GetByEmailAsync(email, ct);
    if (user == null)
        return true; // Don't reveal if user exists

    var token = GenerateResetToken();
    var expiresAt = DateTime.UtcNow.AddHours(1);

    await _userRepository.SavePasswordResetTokenAsync(user.Id, token, expiresAt, ct);

    var resetLink = $"https://czaba.store/reset-password?token={token}";

    await _emailService.SendTransactionalAsync(new TransactionalEmailRequest
    {
        TemplateCode = "PASSWORD_RESET",
        ToEmail = user.Email,
        ToName = user.FirstName ?? user.Email,
        Data = new Dictionary<string, object>
        {
            ["customerName"] = user.FirstName ?? "მომხმარებელო",
            ["resetLink"] = resetLink,
            ["expirationMinutes"] = 60,
            ["expirationText"] = "1 საათში"
        },
        Priority = 1
    }, ct);

    return true;
}
```

---

## 4.3 Chat Notification (Offline Admin)

### User Story

**As a** მომხმარებელი,
**I want to** მივიღო email როცა ადმინი offline-ია და ვწერ ჩათში,
**So that** ვიცოდე რომ ჩემი შეტყობინება მიიღეს და მიპასუხებენ.

### Trigger Point

```csharp
// ChatService.cs
public async Task<ChatMessageResponse> SendMessageAsync(int sessionId, string message, CancellationToken ct)
{
    var session = await _chatRepository.GetSessionAsync(sessionId, ct);

    // Save message
    var savedMessage = await _chatRepository.SaveMessageAsync(sessionId, "User", message, ct);

    // Check if admin is online
    var isAdminOnline = await _chatHub.IsAdminOnlineAsync();

    if (!isAdminOnline)
    {
        // Send notification email
        var adminEmail = await _settingsService.GetAsync("AdminNotificationEmail", ct);

        await _emailService.SendTransactionalAsync(new TransactionalEmailRequest
        {
            TemplateCode = "CHAT_OFFLINE_NOTIFICATION",
            ToEmail = adminEmail,
            ToName = "Admin",
            Data = new Dictionary<string, object>
            {
                ["customerName"] = session.GuestName ?? session.User?.FirstName ?? "Guest",
                ["customerEmail"] = session.GuestEmail ?? session.User?.Email,
                ["message"] = message,
                ["pageUrl"] = session.PageUrl,
                ["chatUrl"] = $"https://admin.czaba.store/chat/{sessionId}"
            },
            Priority = 1
        }, ct);

        // Also send auto-reply to user
        await _chatRepository.SaveMessageAsync(sessionId, "System",
            "გმადლობთ შეტყობინებისთვის! ჩვენი გუნდი მალე დაგიკავშირდებათ.", ct);
    }

    return savedMessage;
}
```

---

## 4.4 Download Links

### Trigger Point

```csharp
// PaymentService.cs (Stripe Webhook Handler)
public async Task HandlePaymentSuccessAsync(string sessionId, CancellationToken ct)
{
    var order = await _orderRepository.GetByStripeSessionIdAsync(sessionId, ct);

    // Update order status
    await _orderRepository.UpdateStatusAsync(order.Id, OrderStatus.Paid, ct);

    // Generate download links
    var downloadLinks = await _downloadService.GenerateLinksAsync(order.Id, ct);

    // Send download ready email
    await _emailService.SendTransactionalAsync(new TransactionalEmailRequest
    {
        TemplateCode = "DOWNLOAD_READY",
        ToEmail = order.Email,
        ToName = order.CustomerName,
        Data = new Dictionary<string, object>
        {
            ["customerName"] = order.CustomerName,
            ["orderNumber"] = order.OrderNumber,
            ["items"] = downloadLinks.Select(d => new {
                title = d.ProductTitle,
                downloadUrl = d.Url,
                expiresAt = d.ExpiresAt.ToString("MMMM dd, yyyy HH:mm UTC")
            }),
            ["downloadCount"] = downloadLinks.Count,
            ["accountUrl"] = "https://czaba.store/account/downloads"
        },
        Priority = 1
    }, ct);
}
```

---

# ნაწილი 5: Admin Panel Features

## 5.1 Email Templates Management UI

### User Story

**As a** ადმინისტრატორი,
**I want to** ვმართო email template-ები Admin Panel-ში ვიზუალური ედიტორით,
**So that** მარტივად შევცვალო email-ების დიზაინი და შინაარსი.

### UI Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Email Templates                                               [+ New Template] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Filter: [All Categories ▼]  [Search...                    ]  [Active ▼] │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Template Name          │ Category      │ Status  │ Updated    │ Actions │ │
│  ├────────────────────────┼───────────────┼─────────┼────────────┼─────────│ │
│  │ შეკვეთის დადასტურება   │ Transactional │ Active  │ Jan 15     │ [Edit]  │ │
│  │ გადახდის დადასტურება   │ Transactional │ Active  │ Jan 10     │ [Edit]  │ │
│  │ მისასალმებელი Email    │ Transactional │ Active  │ Dec 20     │ [Edit]  │ │
│  │ პაროლის აღდგენა        │ Transactional │ Active  │ Dec 15     │ [Edit]  │ │
│  │ Newsletter - January   │ Marketing     │ Draft   │ Jan 18     │ [Edit]  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Template Editor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Edit Template: შეკვეთის დადასტურება                      [Preview] [Save] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Basic Info                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Name: [შეკვეთის დადასტურება                                          ] │ │
│  │ Code: [ORDER_CONFIRMATION          ] (readonly for system templates)   │ │
│  │ Category: [Transactional ▼]                                            │ │
│  │ Subject: [შეკვეთა #{{orderNumber}} შეიქმნა                           ] │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Variables                                            [+ Add Variable]       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ {{customerName}} - მომხმარებლის სახელი (string, required)             │ │
│  │ {{orderNumber}}  - შეკვეთის ნომერი (string, required)                  │ │
│  │ {{totalAmount}}  - ჯამური თანხა (string, required)                     │ │
│  │ {{items}}        - პროდუქტების სია (array, required)                   │ │
│  │ {{orderDate}}    - შეკვეთის თარიღი (string, required)                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌──────────────────────────────┐ ┌──────────────────────────────────────┐   │
│  │ HTML Editor                  │ │ Preview                               │   │
│  │ ┌──────────────────────────┐ │ │ ┌──────────────────────────────────┐ │   │
│  │ │ <html>                   │ │ │ │                                  │ │   │
│  │ │   <body>                 │ │ │ │   გამარჯობა, გიორგი!            │ │   │
│  │ │     <h1>გამარჯობა,       │ │ │ │                                  │ │   │
│  │ │     {{customerName}}!</h1│ │ │ │   შეკვეთა #CZ-2024-ABC123       │ │   │
│  │ │     ...                  │ │ │ │   შეიქმნა!                       │ │   │
│  │ │   </body>                │ │ │ │                                  │ │   │
│  │ │ </html>                  │ │ │ │   ...                            │ │   │
│  │ └──────────────────────────┘ │ │ └──────────────────────────────────┘ │   │
│  └──────────────────────────────┘ └──────────────────────────────────────┘   │
│                                                                               │
│  [Send Test Email]  Email: [test@example.com            ] [Send]             │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.2 Campaign Creation UI

### Campaign List

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Email Campaigns                                            [+ New Campaign] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Filter: [All Status ▼]  [Date Range: Last 30 days ▼]  [Search...]      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Campaign             │ Status    │ Sent/Total │ Open Rate │ Scheduled   │ │
│  ├──────────────────────┼───────────┼────────────┼───────────┼─────────────│ │
│  │ January Newsletter   │ 📤 Sent   │ 1,234/1,234│ 42.5%     │ Jan 15, 10am│ │
│  │ New Year Sale        │ ⏸️ Paused │ 500/2,000  │ 38.2%     │ Jan 1, 12am │ │
│  │ Product Launch       │ 📅 Sched. │ -          │ -         │ Jan 25, 2pm │ │
│  │ Welcome Series #3    │ 📝 Draft  │ -          │ -         │ Not set     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Campaign Editor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  New Campaign                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Step 1: Basic Info                                              [Step 1/4] │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Campaign Name: [January Newsletter                                     ] │ │
│  │ Description:   [Monthly newsletter for all subscribers                 ] │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Step 2: Recipients                                              [Step 2/4] │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ ○ All Users (2,543)                                                     │ │
│  │ ● Segment: [All Buyers ▼] (1,234 users)                                │ │
│  │ ○ Manual List (upload CSV)                                              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Step 3: Content                                                 [Step 3/4] │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Template: [Newsletter - Basic ▼]  [Preview]                            │ │
│  │ Subject:  [ახალი პროდუქტები - იანვარი 2024                           ] │ │
│  │                                                                         │ │
│  │ Template Variables:                                                     │ │
│  │ • headerImage: [https://...                                           ] │ │
│  │ • mainContent: [Rich Text Editor...                                   ] │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Step 4: Schedule                                                [Step 4/4] │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ ○ Send Now                                                              │ │
│  │ ● Schedule: [Jan 25, 2024] [14:00] [Asia/Tbilisi ▼]                    │ │
│  │                                                                         │ │
│  │ Throttling: [100 ▼] emails per minute                                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│                                          [Save Draft]  [Schedule Campaign]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.3 Email Logs/History

### User Story

**As a** ადმინისტრატორი,
**I want to** ვნახო გაგზავნილი email-ების სრული ისტორია,
**So that** შევძლო პრობლემების გამოკვლევა და მომხმარებლის მხარდაჭერა.

### Email Logs UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Email Logs                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Filter:                                                                 │ │
│  │ Status: [All ▼]  Type: [All ▼]  Date: [Last 7 days ▼]                  │ │
│  │ Search: [email or subject...                                         ] │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Time         │ To               │ Subject           │ Status  │ Type    │ │
│  ├──────────────┼──────────────────┼───────────────────┼─────────┼─────────│ │
│  │ Jan 20, 14:32│ user@example.com │ შეკვეთა #CZ-...   │ ✅ Sent │ Order   │ │
│  │ Jan 20, 14:30│ test@test.com    │ პაროლის აღდგენა   │ ✅ Sent │ Auth    │ │
│  │ Jan 20, 14:25│ bad@invalid.xyz  │ გადახდა წარმატ... │ ❌ Failed│ Payment│ │
│  │ Jan 20, 14:20│ buyer@gmail.com  │ Newsletter Jan... │ 📭 Opened│ Campaign│ │
│  │ Jan 20, 14:15│ new@user.com     │ კეთილი იყოს...    │ ✅ Sent │ Welcome │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  [1] [2] [3] ... [50]                              Showing 1-20 of 1,000     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Email Detail View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Email Details                                                    [← Back]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Status: ✅ Sent                                                             │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ To:        user@example.com (გიორგი გიორგაძე)                          │ │
│  │ Subject:   შეკვეთა #CZ-20240120-ABC123 შეიქმნა                          │ │
│  │ Template:  ORDER_CONFIRMATION                                           │ │
│  │ Sent At:   January 20, 2024 14:32:15 UTC                               │ │
│  │ SMTP:      Primary (mail.czaba.store)                                   │ │
│  │ Message ID: <abc123@czaba.store>                                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Event Timeline                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ 14:32:15  ✅ Queued                                                     │ │
│  │ 14:32:16  ✅ Sent via SMTP                                              │ │
│  │ 14:32:18  ✅ Delivered                                                  │ │
│  │ 14:45:23  📭 Opened (IP: 185.xxx.xxx.xxx, Chrome/Windows)              │ │
│  │ 14:45:30  🔗 Clicked: https://czaba.store/downloads                    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  Template Data                                                   [View HTML] │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ {                                                                       │ │
│  │   "customerName": "გიორგი",                                            │ │
│  │   "orderNumber": "CZ-20240120-ABC123",                                 │ │
│  │   "totalAmount": "$149.99",                                            │ │
│  │   "items": [...]                                                        │ │
│  │ }                                                                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  [Resend Email]  [View in Browser]                                           │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5.4 Analytics Dashboard

### Email Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Email Analytics                                    [Export] [Date: Last 30d]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Summary Cards                                                                │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│  │ Total Sent    │ │ Delivered     │ │ Open Rate     │ │ Click Rate    │    │
│  │    15,234     │ │    14,892     │ │    42.5%      │ │    12.3%      │    │
│  │   ↑ 12%       │ │   97.8%       │ │   ↑ 3.2%      │ │   ↑ 1.1%      │    │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                                               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│  │ Bounced       │ │ Complaints    │ │ Unsubscribed  │ │ Queue Size    │    │
│  │      342      │ │       5       │ │      23       │ │     156       │    │
│  │   2.2%        │ │   0.03%       │ │   0.15%       │ │   pending     │    │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                                               │
│  Email Volume Over Time                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │     ▲                                                                   │ │
│  │ 800 │       ████                                                       │ │
│  │     │      ██████    ████                                              │ │
│  │ 600 │     ████████  ██████                                             │ │
│  │     │    ██████████████████    ████                                    │ │
│  │ 400 │   ████████████████████  ██████                                   │ │
│  │     │  ██████████████████████████████                                  │ │
│  │ 200 │ ████████████████████████████████████                             │ │
│  │     │█████████████████████████████████████████                         │ │
│  │   0 └────────────────────────────────────────────────────────────────▶ │ │
│  │       Jan 1   Jan 5   Jan 10   Jan 15   Jan 20                         │ │
│  │                                                                         │ │
│  │       ██ Sent    ██ Opened    ██ Clicked                               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────┐ ┌────────────────────────────────────┐   │
│  │ By Template                    │ │ By Campaign                        │   │
│  │ ┌────────────────────────────┐ │ │ ┌────────────────────────────────┐ │   │
│  │ │ ORDER_CONFIRMATION    5,234 │ │ │ │ January Newsletter      1,234  │ │   │
│  │ │ PAYMENT_SUCCESS       4,123 │ │ │ │ New Year Sale            892   │ │   │
│  │ │ WELCOME               2,345 │ │ │ │ Product Launch           756   │ │   │
│  │ │ DOWNLOAD_READY        2,100 │ │ │ │ Weekly Digest            654   │ │   │
│  │ │ PASSWORD_RESET          432 │ │ │ │ Black Friday              543  │ │   │
│  │ └────────────────────────────┘ │ │ └────────────────────────────────┘ │   │
│  └────────────────────────────────┘ └────────────────────────────────────┘   │
│                                                                               │
│  Delivery Health                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ SMTP Server        │ Status  │ Sent Today │ Limit │ Errors │ Avg Time  │ │
│  ├────────────────────┼─────────┼────────────┼───────┼────────┼───────────│ │
│  │ Primary (mail.cz.) │ ✅ OK   │ 456/10000  │ 4.6%  │ 2      │ 1.2s      │ │
│  │ Backup (smtp.bck.) │ ✅ OK   │ 0/5000     │ 0%    │ 0      │ -         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# იმპლემენტაციის გეგმა

## ფაზა 1: Infrastructure (1-2 კვირა)

| Task | Priority | Estimate |
|------|----------|----------|
| SMTP Configuration table & API | High | 2 days |
| Email Queue table & processor | High | 3 days |
| Rate Limiting implementation | High | 1 day |
| Retry mechanism | High | 1 day |
| Background worker for sending | High | 2 days |
| Basic email sending (MailKit) | High | 1 day |

## ფაზა 2: Templates (1 კვირა)

| Task | Priority | Estimate |
|------|----------|----------|
| Template table & API | High | 2 days |
| Handlebars integration | High | 1 day |
| Variable management | Medium | 1 day |
| Template versioning | Low | 1 day |
| Migrate existing templates | High | 1 day |

## ფაზა 3: Transactional Emails (3-4 დღე)

| Task | Priority | Estimate |
|------|----------|----------|
| Replace Brevo with custom service | High | 1 day |
| Update all trigger points | High | 2 days |
| Testing all email types | High | 1 day |

## ფაზა 4: Campaigns (1 კვირა)

| Task | Priority | Estimate |
|------|----------|----------|
| Campaign table & API | Medium | 2 days |
| Segment management | Medium | 2 days |
| Campaign scheduler | Medium | 1 day |
| Throttling implementation | Medium | 1 day |

## ფაზა 5: Tracking & Analytics (1 კვირა)

| Task | Priority | Estimate |
|------|----------|----------|
| Open tracking (pixel) | Medium | 1 day |
| Click tracking | Medium | 1 day |
| Event logging | Medium | 1 day |
| Analytics aggregation | Medium | 2 days |

## ფაზა 6: Admin UI (1-2 კვირა)

| Task | Priority | Estimate |
|------|----------|----------|
| SMTP config UI | High | 1 day |
| Template editor UI | High | 3 days |
| Campaign creator UI | Medium | 3 days |
| Email logs UI | High | 2 days |
| Analytics dashboard | Medium | 2 days |

---

# ტექნიკური მოთხოვნები

## NuGet Packages

```xml
<PackageReference Include="MailKit" Version="4.x.x" />
<PackageReference Include="Handlebars.Net" Version="2.x.x" />
```

## DNS Requirements (Deliverability)

```
# SPF Record
v=spf1 include:_spf.czaba.store ~all

# DKIM Record
selector._domainkey.czaba.store. IN TXT "v=DKIM1; k=rsa; p=..."

# DMARC Record
_dmarc.czaba.store. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@czaba.store"
```

## Configuration (appsettings.json)

```json
{
  "Email": {
    "DefaultFromEmail": "noreply@czaba.store",
    "DefaultFromName": "CZABA Store",
    "QueuePollingIntervalSeconds": 5,
    "MaxRetriesPerEmail": 3,
    "TrackingBaseUrl": "https://api.czaba.store/email/track",
    "UnsubscribeUrl": "https://czaba.store/unsubscribe"
  }
}
```

---

# არ შედის V1-ში (მომავალი)

- ❌ A/B Testing კამპანიებისთვის
- ❌ AI-based send time optimization
- ❌ Drag-and-drop template builder
- ❌ Email warmup automation
- ❌ Multi-language templates
- ❌ Webhook notifications (delivery status)
- ❌ Email scheduling based on user timezone
- ❌ Advanced spam score checking

---

*შექმნილია: 2026-01-30*
*ვერსია: 1.0*
