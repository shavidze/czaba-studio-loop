# როგორ გამოვიყენოთ Primitives სისტემა

## რა არის Primitive?

**Primitive** არის მცირე, დამოუკიდებელი, მრავალჯერადი ინსტრუქცია, რომელიც ერთ კონკრეტულ წესს ან პატერნს აღწერს.

### მაგალითი

```
primitives/
├── GIT_RULES.md       # Git წესები (10 ხაზი)
├── ERROR_TAXONOMY.md  # Error codes (30 ხაზი)
└── TAILWIND_FIRST.md  # Styling წესები (40 ხაზი)
```

თითოეული primitive არის **standalone** - მუშაობს დამოუკიდებლად.

---

## როგორ გამოვიყენო?

### 1. პირდაპირი მითითება

Claude-თან საუბრისას, უთხარი:

```
"შექმენი ახალი API endpoint.
გამოიყენე primitives/MINIMAL_CONTROLLER.md და primitives/ERROR_TAXONOMY.md წესები."
```

Claude წაიკითხავს ამ ფაილებს და გამოიყენებს.

### 2. Composition გამოყენება

Compositions აერთიანებს რამდენიმე primitive-ს:

```
"გამოიყენე compositions/new-api-endpoint.md რომ შექმნა Products endpoint."
```

### 3. CLAUDE.md-ში მითითება

თითოეული პროექტის CLAUDE.md-ში შეგიძლია დაამატო:

```markdown
## Primitives

ამ პროექტში გამოიყენე შემდეგი primitives:
- `../.claude/primitives/GIT_RULES.md`
- `../.claude/primitives/TYPESCRIPT_STRICT.md`
- `.claude/primitives/HYBRID_REPOSITORY.md`
```

---

## როგორ შევქმნა ახალი Primitive?

### ნაბიჯი 1: იდენტიფიცირება

დააკვირდი: რა წესი/პატერნი იმეორებ ხშირად?

**სიგნალები:**
- ხშირად ვეუბნები Claude-ს იგივეს
- კოდში იგივე შეცდომა მეორდება
- ახალი დეველოპერი ვერ იგებს pattern-ს

### ნაბიჯი 2: ექსტრაქცია

შექმენი ფაილი `.claude/primitives/[NAME].md`:

```markdown
# PRIMITIVE_NAME

## რა არის ეს?
მოკლე აღწერა (1-2 წინადადება)

## წესები
- წესი 1
- წესი 2
- წესი 3

## სწორი მაგალითი
```code
// ასე
```

## არასწორი მაგალითი
```code
// არა ასე
```

## როდის გამოვიყენო?
კონტექსტი და trigger-ები
```

### ნაბიჯი 3: ტესტირება

სცადე primitive ახალ დავალებაზე:

```
"შექმენი X. გამოიყენე primitives/NEW_PRIMITIVE.md"
```

თუ Claude სწორად აკეთებს - primitive მუშაობს.

### ნაბიჯი 4: დახვეწა

თუ Claude შეცდომას უშვებს:
1. გაიგე რატომ
2. დაამატე მაგალითი primitive-ში
3. სცადე ხელახლა

**ეს არის "Compounding" - სისტემა თვითონ უმჯობესდება!**

---

## Primitive vs Composition vs Agent

| ტიპი | ზომა | მიზანი |
|------|------|--------|
| **Primitive** | 20-50 ხაზი | ერთი წესი/პატერნი |
| **Composition** | 50-100 ხაზი | რამდენიმე primitive ერთად |
| **Agent** | 100+ ხაზი | სრული როლი + კონტექსტი |

### როდის რომელი?

```
"არ გამოიყენო any TypeScript-ში"
→ Primitive (TYPESCRIPT_STRICT.md)

"შექმენი API endpoint"
→ Composition (new-api-endpoint.md = 5 primitive)

"შენ ხარ Code Reviewer"
→ Agent (code-reviewer.md = როლი + primitive-ები + workflow)
```

---

## Feedback Loop (კომპაუნდინგის ბირთვი)

### როცა Claude შეცდომას უშვებს:

1. **დააკვირდი:** რა დააშავა?
2. **იკითხე:** რატომ? prompt არასრულია? წესი არ იცის?
3. **გაასწორე წყარო:**
   - Primitive-ში დაამატე მაგალითი
   - ან შექმენი ახალი primitive
4. **მომავალში:** იგივე შეცდომა აღარ განმეორდება

### მაგალითი:

```
Claude-მა შექმნა კომპონენტი bg-[#13D9CC]-ით

↓ ანალიზი
Primitive-ში არ ეწერა "არა bg-[#hex]"

↓ გასწორება
TAILWIND_FIRST.md-ში დავამატე:
"❌ არასწორი: bg-[#13D9CC]"
"✅ სწორი: bg-brand"

↓ შედეგი
მომავალში Claude აღარ გამოიყენებს hex-ს
```

---

## ფოლდერის სტრუქტურა

```
czaba-project/
├── .claude/
│   ├── primitives/          # გლობალური (ყველა პროექტისთვის)
│   │   ├── GIT_RULES.md
│   │   ├── ERROR_TAXONOMY.md
│   │   ├── DESIGN_TOKENS.md
│   │   └── ...
│   │
│   ├── compositions/        # გლობალური კომბინაციები
│   │   ├── new-api-endpoint.md
│   │   ├── new-react-feature.md
│   │   └── new-user-story.md
│   │
│   └── HOW_TO_USE_PRIMITIVES.md  # ეს ფაილი
│
├── backend/.claude/
│   └── primitives/          # Backend-specific
│       ├── HYBRID_REPOSITORY.md
│       ├── MINIMAL_CONTROLLER.md
│       └── STATE_MACHINE.md
│
├── store/.claude/
│   └── primitives/          # Store-specific
│       ├── TAILWIND_FIRST.md
│       ├── REACT_CONTEXT.md
│       ├── FORWARDREF_COMPONENT.md
│       └── AUDIO_ARCHITECTURE.md
│
└── admin/.claude/
    └── primitives/          # Admin-specific
        └── REACT_QUERY_PATTERNS.md
```

---

## Quick Reference

### ხშირად გამოყენებული ფრაზები

```
"გამოიყენე primitives/X.md წესები"

"შექმენი compositions/new-api-endpoint.md-ის მიხედვით"

"დაამატე ეს წესი primitives/X.md-ში"

"რა primitive-ები გამომადგება [task]-ისთვის?"
```

---

## 2 წლის პერსპექტივა

### წელი 1 (დღეს → 6 თვე)
- 10-15 primitive დაგროვდება
- ყოველი შეცდომა → ახალი წესი
- Claude უკეთ "იცნობს" პროექტს

### წელი 1.5 (6-18 თვე)
- 30+ primitive
- Compositions რთული ამოცანებისთვის
- ახალი დეველოპერი სწრაფად ერგება

### წელი 2 (18-24 თვე)
- სისტემა "იცნობს" შენს სტილს
- Claude თითქმის არ შეცდება
- დრო მხოლოდ ახალ ფიჩერებზე იხარჯება

**ეს არის Compounding Effect - მცირე გაუმჯობესებები × დრო = მასიური შედეგი**
