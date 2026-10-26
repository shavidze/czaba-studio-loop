# CZABA Store - დოკუმენტაცია

## სტრუქტურა

```
docs/
├── README.md                 # ეს ფაილი
├── CHANGELOG.md              # ცვლილებების ისტორია
├── PRE_PRODUCTION_CHECKLIST.md
│
├── guides/                   # Setup & Integration
│   ├── setup.md
│   ├── shopify-integration.md
│   ├── tailwind-migration.md
│   └── stems-setup.md
│
├── design/                   # Design System & Vision
│   ├── brand-vision.md
│   ├── design-system.md
│   ├── design-audit.md
│   └── ...
│
├── technical/                # Technical Documentation
│   ├── README.md             # Tech docs ინდექსი
│   ├── overview.md           # პროექტის მიმოხილვა
│   ├── studio.md             # Studio (DAW) დოკუმენტაცია
│   ├── testing.md            # Testing guide
│   ├── architecture/
│   ├── components/
│   └── features/
│
├── user-stories/                  # User Stories
│   
│
└── prompts/                  # AI Prompt Templates
    └── ...
```

---

## სწრაფი ლინკები

### Getting Started
- [Setup Guide](guides/setup.md) - პროექტის გაშვება
- [Shopify Integration](guides/shopify-integration.md) - Shopify კონფიგურაცია

### Technical
- [Technical Overview](technical/overview.md) - არქიტექტურა, სტეკი
- [Service Layer](technical/architecture/service-layer.md) - Shopify API services
- [Auth System](technical/architecture/auth-system.md) - Authentication
- [Testing](technical/testing.md) - Unit & E2E tests

### Design
- [Brand Vision](design/brand-vision.md) - ბრენდის ხედვა
- [Design System](design/design-system.md) - UI კომპონენტები, tokens

### Studio (DAW)
- [Studio Technical](technical/studio.md) - Web Audio, WaveSurfer
- [StudioContext](technical/architecture/StudioContext.md) - State management

---

## ბრძანებები

```bash
# Development
npm run dev

# Testing
npm run test:run      # Unit tests (30)
npm run test:e2e      # E2E tests (5)

# Build
npm run build
```

---

## კონვენციები

- დოკუმენტაცია იწერება **ქართულად**
- ფაილების სახელები **kebab-case** (მაგ: `auth-system.md`)
- ყოველი ახალი feature → დოკუმენტაცია `technical/features/`-ში
- არქიტექტურული გადაწყვეტილებები → `technical/architecture/`-ში
