# Claude Code Setup - დოკუმენტაცია

> პროექტში კონფიგურირებული Claude Code agents, commands და prompts სისტემა.

---

## რა არის .claude/ ფოლდერი?

`.claude/` არის Claude Code CLI-ს კონფიგურაციის ფოლდერი, სადაც შეგვიძლია განვსაზღვროთ:
- **Agents** - სპეციალიზებული AI ასისტენტები
- **Commands** - Slash commands (/name)
- **Prompts** - Templates და reference მასალა

---

## სტრუქტურა

```
.claude/
├── settings.local.json          # Local settings (gitignore-ში)
│
├── agents/                      # სპეციალიზებული აგენტები
│   ├── design-auditor.md        # დიზაინ სისტემის აუდიტი
│   ├── code-reviewer.md         # კოდის რევიუ
│   ├── shopify-helper.md        # Shopify API დახმარება
│   ├── studio-specialist.md     # Web Audio/Studio ექსპერტი
│   └── feature-planner.md       # Feature planning
│
├── commands/                    # Slash commands
│   ├── audit-design.md          # /audit-design
│   ├── debug-auth.md            # /debug-auth
│   ├── debug-shopify.md         # /debug-shopify
│   ├── debug-studio.md          # /debug-studio
│   └── test.md                  # /test
│
└── prompts/                     # Templates
    ├── new-component.md         # React კომპონენტის template
    ├── new-service.md           # Service layer pattern
    └── new-route.md             # Remix route pattern
```

---

## Agents vs Commands vs Prompts

### განსხვავება

| ტიპი | როგორ მუშაობს | როდის გამოვიყენოთ |
|------|---------------|-------------------|
| **Agent** | Claude ავტომატურად ირჩევს | კომპლექსური, სპეციალიზებული ამოცანები |
| **Command** | `/name` - explicit გამოძახება | როცა კონკრეტული action გინდა |
| **Prompt** | Manual reference | Templates, boilerplate კოდი |

### პრაქტიკული მაგალითი

```
შენ იტყვი: "Studio-ში timeline არ მოძრაობს"
→ Claude ავტომატურად იძახებს studio-specialist agent-ს

შენ იტყვი: "/debug-auth"
→ იტვირთება debug-auth command

შენ იტყვი: "ახალი კომპონენტი შემიქმენი"
→ Claude კითხულობს new-component.md template-ს
```

---

## Agents - დეტალურად

### რა არის Agent?

Agent არის სპეციალიზებული AI ასისტენტი კონკრეტული დომენის ცოდნით. Claude Code-ს შეუძლია ავტომატურად დელეგირება გაუკეთოს agent-ს როცა შესაბამისი ამოცანა დგება.

### Agent ფაილის ფორმატი

```markdown
---
name: agent-name
description: როდის გამოვიყენოთ ეს agent
tools: Read, Glob, Grep, Bash, Write, Edit
model: opus
---

System prompt აქ...
```

### ჩვენი Agents

#### 1. design-auditor
**დანიშნულება:** კომპონენტის/გვერდის დიზაინ სისტემასთან შესაბამისობის შემოწმება

**როდის გამოიყენება:**
- "ეს კომპონენტი დიზაინს შეესაბამება?"
- "შეამოწმე HeroSection-ის სტილები"
- "design audit გაუკეთე"

**რა იცის:**
- CZABA-ს ფერთა პალიტრა
- Spacing system (4px base)
- Typography scale
- UI კომპონენტების სტანდარტები

#### 2. code-reviewer
**დანიშნულება:** კოდის ხარისხის, უსაფრთხოების და best practices შემოწმება

**როდის გამოიყენება:**
- "გადახედე ამ კოდს"
- "code review"
- "რამე პრობლემა ხომ არ არის?"

**რა ამოწმებს:**
- TypeScript typing
- React patterns
- Remix conventions
- Security issues
- Performance

#### 3. shopify-helper
**დანიშნულება:** Shopify Storefront API-თან დაკავშირებული დახმარება

**როდის გამოიყენება:**
- "Shopify-ში პრობლემაა"
- "GraphQL query როგორ დავწერო?"
- "cart არ მუშაობს"

**რა იცის:**
- Service Layer (ProductService, CustomerService, CartService)
- GraphQL syntax
- Common errors და solutions
- Shopify GID format

#### 4. studio-specialist
**დანიშნულება:** Personal Mixdown Studio-ს (Web Audio) ექსპერტი

**როდის გამოიყენება:**
- "Studio-ში bug არის"
- "აუდიო არ უკრავს"
- "waveform არ ჩანს"
- "export არ მუშაობს"

**რა იცის:**
- Web Audio API
- WaveSurfer.js
- AudioContext, AudioBuffer
- Solo/Mute logic
- FFmpeg.wasm
- IndexedDB audio cache

#### 5. feature-planner
**დანიშნულება:** ახალი feature-ის დაგეგმვა და backlog მართვა

**როდის გამოიყენება:**
- "ახალი feature მინდა"
- "რა არის დაგეგმილი?"
- "wishlist როგორ დავამატო?"

**რა იცის:**
- docs/future-features/ backlog
- Feature specification template
- Technical stack
- Implementation patterns

---

## Commands - დეტალურად

### რა არის Command?

Command არის slash command (`/name`), რომელიც explicit უნდა გამოიძახო. შეიცავს ინსტრუქციებს და reference მასალას.

### ჩვენი Commands

| Command | დანიშნულება |
|---------|-------------|
| `/audit-design` | დიზაინ სისტემის აუდიტი + ჩეკლისტი |
| `/debug-auth` | Auth სისტემის debugging გზამკვლევი |
| `/debug-shopify` | Shopify API debugging |
| `/debug-studio` | Studio/Audio debugging |
| `/test` | ტესტების გაშვება |

### გამოყენება

```
/audit-design ProductCard.tsx
/debug-auth
/test products
```

---

## Prompts - დეტალურად

### რა არის Prompt?

Prompt არის template/reference მასალა, რომელსაც Claude კითხულობს საჭიროებისას. ავტომატურად არ იტვირთება.

### ჩვენი Prompts

| Prompt | შეიცავს |
|--------|---------|
| `new-component.md` | React კომპონენტის სტრუქტურა, Tailwind patterns, cn() utility |
| `new-service.md` | Service Layer pattern, GraphQL queries/mutations |
| `new-route.md` | Remix route სტრუქტურა, loader/action, meta |

---

## რატომ ეს მიდგომა?

### 1. კონტექსტის ოპტიმიზაცია

**პრობლემა:** Claude-ს აქვს კონტექსტის ლიმიტი. ყველა დოკუმენტაციის ჩატვირთვა არაეფექტურია.

**გადაწყვეტა:** Agent/Command სისტემა იტვირთება მხოლოდ საჭიროებისას.

```
ცუდი:  ყოველთვის ჩატვირთე 10 დოკუმენტი
კარგი: ჩატვირთე მხოლოდ შესაბამისი agent/command
```

### 2. სპეციალიზაცია

**პრობლემა:** Generic AI არ იცნობს შენი პროექტის სპეციფიკას.

**გადაწყვეტა:** თითოეული agent არის ექსპერტი კონკრეტულ დომენში.

```
studio-specialist იცის:
- StudioContext.tsx-ის სტრუქტურა
- Web Audio API patterns
- ჩვენი Solo/Mute logic
- Common bugs და solutions
```

### 3. თანმიმდევრულობა

**პრობლემა:** ყოველ ჯერზე იგივე ინსტრუქციების გამეორება.

**გადაწყვეტა:** ერთხელ დაწერე, ყოველთვის გამოიყენე.

```
new-component.md შეიცავს:
- ფაილის სტრუქტურა
- Tailwind-first წესები
- cn() გამოყენება
- Checklist
```

### 4. გუნდური მუშაობა

**პრობლემა:** სხვადასხვა დეველოპერი სხვადასხვანაირად მუშაობს.

**გადაწყვეტა:** `.claude/` ფოლდერი git-შია, გუნდს აქვს იგივე setup.

```
git clone project
→ Claude Code მზადაა ყველა agent/command-ით
```

### 5. ავტომატური დელეგირება

**პრობლემა:** უნდა იცოდე რომელი დოკუმენტაცია წაიკითხო.

**გადაწყვეტა:** Claude თვითონ ირჩევს შესაბამის agent-ს.

```
შენ: "Studio-ში timeline არ მოძრაობს"
Claude: [იძახებს studio-specialist-ს]
→ უკვე იცის StudioContext, Web Audio, common bugs
```

---

## როგორ დავამატო ახალი Agent/Command/Prompt?

### ახალი Agent

1. შექმენი `.claude/agents/name.md`
2. ფორმატი:
```markdown
---
name: agent-name
description: როდის გამოვიყენოთ
tools: Read, Glob, Grep
model: opus
---

System prompt...
```

### ახალი Command

1. შექმენი `.claude/commands/name.md`
2. შეიცავს ინსტრუქციებს და reference
3. გამოძახება: `/name`

### ახალი Prompt

1. შექმენი `.claude/prompts/name.md`
2. Template/boilerplate კოდი
3. Claude კითხულობს საჭიროებისას

---

## Model არჩევა

```yaml
model: opus    # უმაღლესი - რთული ამოცანები (ჩვენი default)
model: sonnet  # საშუალო - კარგი ბალანსი
model: haiku   # სწრაფი - მარტივი ამოცანები
```

ჩვენ ყველა agent-ში `opus` გვაქვს - საუკეთესო შედეგებისთვის.

---

## Tools

Agent-ს შეუძლია გამოიყენოს:

| Tool | რას აკეთებს |
|------|-------------|
| `Read` | ფაილის წაკითხვა |
| `Glob` | ფაილების ძებნა pattern-ით |
| `Grep` | ტექსტის ძებნა ფაილებში |
| `Bash` | Terminal commands |
| `Write` | ფაილის შექმნა |
| `Edit` | ფაილის რედაქტირება |
| `WebSearch` | ვებ ძებნა |

---

## Summary

| რა | რატომ | როგორ |
|----|-------|-------|
| **Agents** | ავტომატური ექსპერტი | description-ის მიხედვით |
| **Commands** | Explicit კონტროლი | `/command-name` |
| **Prompts** | Templates | Manual reference |

ეს სისტემა გვაძლევს:
- ✅ ოპტიმიზებული კონტექსტი
- ✅ სპეციალიზებული ცოდნა
- ✅ თანმიმდევრული output
- ✅ გუნდური sharing
- ✅ ავტომატური დელეგირება

---

*Last updated: 2026-01-13*
