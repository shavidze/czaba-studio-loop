# Extend Claude with Skills

> Claude Code-ის შესაძლებლობების გაფართოება Skills-ების საშუალებით.
> წყარო: https://docs.anthropic.com/en/docs/claude-code/skills

---

## ქართული ჩანიშვნები (Key Takeaways)

### რა არის Skill?
- `SKILL.md` ფაილი ინსტრუქციებით, რომელსაც Claude იყენებს საჭიროებისას
- `/skill-name` ბრძანებით პირდაპირ გამოძახება, ან Claude თავისით ტრიგერავს
- `.claude/commands/` და `.claude/skills/` ერთნაირად მუშაობს, skills უფრო ახალია და მეტი ფუნქციონალი აქვს

### სად ინახება Skills?
| მდებარეობა | ბილიკი | ვისთვის |
|-----------|--------|---------|
| Enterprise | managed settings | ორგანიზაცია |
| Personal | `~/.claude/skills/<name>/SKILL.md` | შენი ყველა პროექტი |
| Project | `.claude/skills/<name>/SKILL.md` | ეს პროექტი |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | სადაც plugin ჩართულია |

### პრიორიტეტი: enterprise > personal > project

### Frontmatter ველები
- `name` - slash command სახელი (lowercase, hyphens)
- `description` - რას აკეთებს (Claude ამით წყვეტს როდის გამოიყენოს)
- `disable-model-invocation: true` - მხოლოდ მომხმარებელი ტრიგერავს (deploy, commit)
- `user-invocable: false` - მხოლოდ Claude ტრიგერავს (background knowledge)
- `allowed-tools` - ნებადართული ინსტრუმენტები (Read, Grep, Bash, etc.)
- `context: fork` - იზოლირებულ subagent-ში გაშვება
- `agent` - agent ტიპი fork-ისთვის (Explore, Plan, general-purpose)
- `argument-hint` - autocomplete-ში hint

### ორი ტიპის კონტენტი
1. **Reference** - ცოდნა/წესები (API conventions, style guides) - inline ჩაიტვირთება
2. **Task** - ნაბიჯ-ნაბიჯ ინსტრუქციები (deploy, commit) - ხშირად `disable-model-invocation: true`

### String Substitutions
- `$ARGUMENTS` - ყველა არგუმენტი
- `$ARGUMENTS[N]` ან `$N` - კონკრეტული არგუმენტი (0-based)
- `${CLAUDE_SESSION_ID}` - სესიის ID

### Dynamic Context
- `` !`command` `` - shell ბრძანება რომელიც skill-ის ჩატვირთვამდე ეშვება
- output ჩანაცვლდება skill კონტენტში

### Context Budget
- Skill descriptions იტვირთება კონტექსტში (2% of context window, fallback 16,000 chars)
- ძალიან ბევრი skill-ის შემთხვევაში ზოგი შეიძლება არ ჩაიტვირთოს
- `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var-ით override

### SKILL.md < 500 ხაზი, დეტალები ცალკე ფაილებში

---

## Full Documentation

Skills extend what Claude can do. Create a `SKILL.md` file with instructions, and Claude adds it to its toolkit. Claude uses skills when relevant, or you can invoke one directly with `/skill-name`.

> **Custom slash commands have been merged into skills.** A file at `.claude/commands/review.md` and a skill at `.claude/skills/review/SKILL.md` both create `/review` and work the same way. Your existing `.claude/commands/` files keep working. Skills add optional features: a directory for supporting files, frontmatter to control whether you or Claude invokes them, and the ability for Claude to load them automatically when relevant.

Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard.

---

## Getting Started

### Create your first skill

```bash
mkdir -p ~/.claude/skills/explain-code
```

Every skill needs a `SKILL.md`:

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?
```

### Where skills live

| Location | Path | Applies to |
|----------|------|------------|
| Enterprise | managed settings | All users in organization |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<skill-name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Where plugin is enabled |

Priority: enterprise > personal > project. Plugin skills use `plugin-name:skill-name` namespace.

#### Automatic discovery from nested directories

When editing files in subdirectories, Claude Code discovers skills from nested `.claude/skills/` dirs. Supports monorepo setups.

Each skill is a directory:

```
my-skill/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for Claude to fill in
├── examples/
│   └── sample.md      # Example output
└── scripts/
    └── validate.sh    # Script Claude can execute
```

---

## Configure Skills

### Types of skill content

**Reference content** - knowledge applied to current work (inline):

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

**Task content** - step-by-step instructions (often `disable-model-invocation: true`):

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

### Frontmatter Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name. Lowercase, numbers, hyphens (max 64 chars). Default: directory name |
| `description` | Recommended | What it does and when to use it |
| `argument-hint` | No | Hint for autocomplete, e.g. `[issue-number]` |
| `disable-model-invocation` | No | `true` = only user can invoke. Default: `false` |
| `user-invocable` | No | `false` = hidden from `/` menu. Default: `true` |
| `allowed-tools` | No | Tools Claude can use without asking permission |
| `model` | No | Model to use when skill is active |
| `context` | No | `fork` = run in forked subagent context |
| `agent` | No | Subagent type for `context: fork` |
| `hooks` | No | Hooks scoped to skill lifecycle |

### String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed |
| `$ARGUMENTS[N]` | Specific argument by 0-based index |
| `$N` | Shorthand for `$ARGUMENTS[N]` |
| `${CLAUDE_SESSION_ID}` | Current session ID |

### Add Supporting Files

```
my-skill/
├── SKILL.md (required - overview and navigation)
├── reference.md (detailed API docs - loaded when needed)
├── examples.md (usage examples - loaded when needed)
└── scripts/
    └── helper.py (utility script - executed, not loaded)
```

Keep `SKILL.md` under 500 lines. Move detailed reference to separate files.

### Control Who Invokes a Skill

| Frontmatter | You can invoke | Claude can invoke | When loaded |
|-------------|---------------|-------------------|-------------|
| (default) | Yes | Yes | Description always in context, full loads on invoke |
| `disable-model-invocation: true` | Yes | No | Description NOT in context |
| `user-invocable: false` | No | Yes | Description always in context |

### Restrict Tool Access

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

### Pass Arguments

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.
```

`/fix-issue 123` -> "Fix GitHub issue 123 following our coding standards..."

Positional: `$ARGUMENTS[0]`, `$ARGUMENTS[1]` or `$0`, `$1`

---

## Advanced Patterns

### Inject Dynamic Context

`` !`command` `` runs shell commands before content is sent to Claude:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

### Run Skills in a Subagent

`context: fork` runs skill in isolation (no conversation history):

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

Agent options: `Explore`, `Plan`, `general-purpose`, or custom from `.claude/agents/`.

### Restrict Claude's Skill Access

Permission rules:
```
# Allow specific skills
Skill(commit)
Skill(review-pr *)

# Deny specific skills
Skill(deploy *)
```

---

## Troubleshooting

- **Skill not triggering**: Check description keywords, verify with "What skills are available?", try `/skill-name` directly
- **Triggers too often**: Make description more specific, add `disable-model-invocation: true`
- **Not all skills visible**: Context budget limit (2% of window). Check `/context` for warnings. Override with `SLASH_COMMAND_TOOL_CHAR_BUDGET`

---

## Related Resources

- [Subagents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Plugins](https://docs.anthropic.com/en/docs/claude-code/plugins)
- [Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Memory](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Permissions](https://docs.anthropic.com/en/docs/claude-code/permissions)
