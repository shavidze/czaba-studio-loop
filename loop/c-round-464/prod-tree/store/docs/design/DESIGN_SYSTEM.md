# CZABA Design System v2.0

> ⚠️ **IMPORTANT FOR AI ASSISTANTS**: This is the single source of truth for all design decisions.
> Always reference this file before writing CSS or component styles.

---

# Part 1: Design Foundations (პროფესიონალური პრინციპები)

ეს სექცია შეიცავს ფუნდამენტურ დიზაინის პრინციპებს, რომლებიც ყველა პროფესიონალმა დიზაინერმა უნდა იცოდეს.

---

## 🎼 Visual Rhythm (ვიზუალური რიტმი)

რიტმი დიზაინში არის ელემენტების განმეორებადი pattern, რომელიც ქმნის თანმიმდევრულობას და ჰარმონიას.

### Vertical Rhythm (ვერტიკალური რიტმი)

ვერტიკალური რიტმი განსაზღვრავს თანმიმდევრულ ვერტიკალურ spacing-ს მთელ გვერდზე.

**Baseline Grid:**
```
Base unit: 8px (ან 4px მცირე ელემენტებისთვის)

ყველა ვერტიკალური spacing უნდა იყოს ამ unit-ის ჯერადი:
- 8px, 16px, 24px, 32px, 48px, 64px, 96px...
```

**Line Height (ტექსტის რიტმი):**
```css
/* line-height უნდა ქმნიდეს baseline grid-თან alignment */
body {
  font-size: 16px;
  line-height: 24px;  /* 1.5 × 16 = 24px (8-ის ჯერადი) */
}

h1 {
  font-size: 48px;
  line-height: 56px;  /* 8-ის ჯერადი */
  margin-bottom: 24px; /* 8-ის ჯერადი */
}
```

**რატომ არის მნიშვნელოვანი:**
- ქმნის ვიზუალურ ჰარმონიას
- ტექსტის ბლოკები გასწორდება
- გვერდი უფრო "მოწესრიგებულად" გამოიყურება
- მარტივია spacing-ის მართვა

### Horizontal Rhythm (ჰორიზონტალური რიტმი)

ჰორიზონტალური რიტმი განსაზღვრავს column-ებს, gutter-ებს და padding-ს.

**Grid System:**
```
Container: 1280px max-width
Columns: 12 (ან 4 mobile-ზე)
Gutter: 24px (spacing-6)
Margin: 16px mobile, 24px tablet, 32px desktop
```

**Consistent Padding:**
```css
/* ყველა სექცია ერთნაირი ჰორიზონტალური padding */
.section {
  padding-inline: 16px;  /* mobile */
  padding-inline: 24px;  /* tablet */
  padding-inline: 32px;  /* desktop */
}
```

---

## 📐 8-Point Grid System

ინდუსტრიის სტანდარტი spacing სისტემა.

### რატომ 8px?

1. **იყოფა თანაბრად:** 8 ÷ 2 = 4, 8 ÷ 4 = 2
2. **Scaling:** 8, 16, 24, 32, 40, 48... ლამაზი პროგრესია
3. **Device Compatibility:** მეტი ეკრანი იყენებს 8-ის ჯერად resolution-ს
4. **Design Tools:** Figma, Sketch ადვილად მართავს 8px grid-ს

### Spacing Scale

```
4px   - Micro spacing (icon gaps, tight elements)
8px   - Small spacing (related elements)
16px  - Medium spacing (component padding)
24px  - Large spacing (section gaps)
32px  - XL spacing (major sections)
48px  - 2XL spacing (page sections)
64px  - 3XL spacing (hero areas)
96px  - 4XL spacing (major divisions)
```

### გამოყენების წესები

| Element Type | Spacing |
|-------------|---------|
| Icon და label | 4-8px |
| Button padding | 12-16px vertical, 16-24px horizontal |
| Card padding | 16-24px |
| Form gaps | 16px |
| Section padding | 48-96px |
| Component margins | 24-32px |

---

## 👁️ Visual Hierarchy (ვიზუალური იერარქია)

ელემენტების მნიშვნელობის გამოხატვა ვიზუალური საშუალებებით.

### იერარქიის ინსტრუმენტები

**1. Size (ზომა)**
```
უფრო დიდი = უფრო მნიშვნელოვანი

Hero Title:     72px
Section Title:  36-48px
Card Title:     20-24px
Body Text:      16px
Caption:        12-14px
```

**2. Weight (სისქე)**
```
Bold (700):     Headlines, CTAs
Semibold (600): Sub-headlines, labels
Medium (500):   UI elements
Regular (400):  Body text
```

**3. Color (ფერი)**
```css
--color-foreground: 94% lightness  /* Primary - ყველაზე მნიშვნელოვანი */
--color-muted:      55% lightness  /* Secondary */
--color-dim:        35% lightness  /* Tertiary - ყველაზე ნაკლებად */
```

**4. Contrast (კონტრასტი)**
```
High contrast:  Primary actions, headlines
Medium:         Body content
Low:            Decorative, background elements
```

**5. Position (პოზიცია)**
```
- ზედა მარცხენა = პირველი ხედვის წერტილი (LTR)
- ცენტრში = ფოკუსის წერტილი
- ზემოთ = უფრო მნიშვნელოვანი
```

**6. Whitespace (თავისუფალი სივრცე)**
```
მეტი whitespace გარშემო = მეტი მნიშვნელობა
Hero-ს აქვს დიდი padding
CTA ღილაკებს აქვთ "breathing room"
```

### იერარქიის დონეები

```
Level 1: Hero headline, Primary CTA
Level 2: Section titles, Secondary CTAs
Level 3: Card titles, Navigation
Level 4: Body text, Descriptions
Level 5: Captions, Metadata, Hints
```

---

## 🧠 Gestalt Principles (გეშტალტის პრინციპები)

ფსიქოლოგიური პრინციპები, როგორ აღიქვამს ადამიანი ვიზუალურ ინფორმაციას.

### 1. Proximity (სიახლოვე)
```
ახლოს მყოფი ელემენტები ჯგუფად აღიქმება.

✅ სწორი:
[Label]
[Input]        ← 4px gap (დაკავშირებული)

              ← 24px gap

[Label]
[Input]        ← 4px gap (ახალი ჯგუფი)

❌ არასწორი:
[Label]
              ← 16px gap
[Input]
              ← 16px gap
[Label]
              ← 16px gap (ყველაფერი ერთნაირი)
```

### 2. Similarity (მსგავსება)
```
მსგავსი ელემენტები ჯგუფად აღიქმება.

- ერთნაირი ფერის ღილაკები = ერთი ტიპის action
- ერთნაირი ზომის cards = ერთნაირი მნიშვნელობა
- ერთნაირი icon style = კავშირი
```

### 3. Continuity (უწყვეტობა)
```
თვალი მიჰყვება ხაზებს და curves.

- Navigation items ერთ ხაზზე
- Progress indicators
- Timeline designs
```

### 4. Closure (დახურვა)
```
ტვინი ავსებს არასრულ ფორმებს.

- Logo designs
- Icon abstractions
- Loading skeletons
```

### 5. Figure-Ground (ფიგურა-ფონი)
```
ელემენტები გამოიყოფა ფონიდან.

- Modal backdrop blur
- Card elevation/shadow
- Focus states
```

### 6. Common Region (საერთო რეგიონი)
```
Border ან background აჯგუფებს ელემენტებს.

- Card containers
- Form sections
- Feature boxes
```

---

## ⬜ Whitespace (თავისუფალი სივრცე)

Whitespace (ან Negative Space) არის ცარიელი სივრცე ელემენტებს შორის.

### Whitespace-ის ტიპები

**Micro Whitespace:**
```
- ასოებს შორის (letter-spacing)
- სიტყვებს შორის (word-spacing)
- ხაზებს შორის (line-height)
```

**Macro Whitespace:**
```
- ელემენტებს შორის (margins, gaps)
- სექციებს შორის (section padding)
- გვერდის კიდეები (page margins)
```

### Whitespace-ის ფუნქციები

| ფუნქცია | მაგალითი |
|---------|----------|
| **Grouping** | დაკავშირებული ელემენტები ახლოს |
| **Separation** | სხვადასხვა სექციების გამიჯვნა |
| **Emphasis** | მნიშვნელოვანი ელემენტის გამოყოფა |
| **Breathing room** | კომფორტული კითხვა |
| **Luxury feel** | Premium brands use more whitespace |

### წესები

```
❌ არ შეავსო ყველა ცარიელი ადგილი
❌ არ დატოვო თანაბარი whitespace ყველგან
✅ მეტი whitespace მნიშვნელოვან ელემენტებს
✅ ნაკლები whitespace დაკავშირებულ ელემენტებს
```

---

## 📖 Reading Patterns (კითხვის პატერნები)

როგორ სკანირებს მომხმარებელი გვერდს.

### F-Pattern (Content-heavy pages)

```
█████████████████
████████
███████████████
████████
█████████████

მომხმარებელი:
1. კითხულობს ჰორიზონტალურად ზემოთ
2. ჩამოდის და კითხულობს ნაკლებს
3. სკანირებს ვერტიკალურად მარცხენა მხარეს
```

**გამოყენება:** Blog, News, Documentation

### Z-Pattern (Minimal pages)

```
1 ──────────► 2
              │
              ▼
3 ◄────────── 4

1. Logo (ზედა მარცხენა)
2. Navigation (ზედა მარჯვენა)
3. Headline (ქვედა მარცხენა)
4. CTA (ქვედა მარჯვენა)
```

**გამოყენება:** Landing pages, Hero sections

### Gutenberg Diagram

```
┌─────────────┬─────────────┐
│  Primary    │   Strong    │
│  Optical    │   Fallow    │
│  Area       │   Area      │
├─────────────┼─────────────┤
│   Weak      │  Terminal   │
│   Fallow    │   Area      │
│   Area      │             │
└─────────────┴─────────────┘

- Primary: Logo, main headline
- Terminal: CTA, next step
```

---

## ⚖️ Balance & Composition (ბალანსი)

### Symmetrical Balance (სიმეტრიული)
```
       │
  ███  │  ███
 █████ │ █████
  ███  │  ███
       │

გამოყენება: Formal, Traditional, Trust
მაგალითი: Auth forms, Modals
```

### Asymmetrical Balance (ასიმეტრიული)
```
███████
███
               █████████

გამოყენება: Dynamic, Modern, Interesting
მაგალითი: Hero sections, Feature layouts
```

### Visual Weight Factors

| Factor | Heavy | Light |
|--------|-------|-------|
| Size | Large | Small |
| Color | Dark, Saturated | Light, Muted |
| Density | Complex | Simple |
| Position | Lower, Right | Upper, Left |

---

## 📏 Proportion & Scale

### Golden Ratio (1:1.618)

```
ოქროს პროპორცია ბუნებაში და ხელოვნებაში.

1 : 1.618 : 2.618 : 4.236...

გამოყენება:
- Layout divisions
- Typography scale
- Spacing relationships
```

### Modular Scale

```
Base: 16px
Ratio: 1.25 (Major Third)

16 × 1.25 = 20
20 × 1.25 = 25
25 × 1.25 = 31
31 × 1.25 = 39
39 × 1.25 = 49
...

ეს ქმნის ჰარმონიულ typography scale-ს.
```

### Rule of Thirds

```
┌───┬───┬───┐
│   │   │   │
├───┼───┼───┤
│   │ ● │   │  ← Focal points at intersections
├───┼───┼───┤
│   │   │   │
└───┴───┴───┘
```

---

## 🔄 Consistency & Repetition

### Design Tokens

```
ყველა value-ს აქვს სახელი და ერთი source of truth:

❌ არასწორი:
padding: 23px;
color: #13D9CC;
border-radius: 11px;

✅ სწორი:
padding: var(--spacing-6);
color: var(--color-brand);
border-radius: var(--radius-lg);
```

### Component-Based Design

```
ერთხელ დიზაინი → ბევრჯერ გამოყენება

Button component:
- ერთი source
- ერთი styling
- ყველგან თანმიმდევრული
```

### Pattern Library

```
განმეორებადი patterns:
- Card layouts
- Form patterns
- Navigation patterns
- Error states
- Loading states
```

---

## 📱 Responsive Design Principles

### Mobile-First

```css
/* დაიწყე mobile-დან */
.element {
  padding: 16px;           /* Mobile default */
}

@media (min-width: 768px) {
  .element {
    padding: 24px;         /* Tablet+ */
  }
}

@media (min-width: 1024px) {
  .element {
    padding: 32px;         /* Desktop */
  }
}
```

### Breakpoints

```
sm:  640px   - Large phones
md:  768px   - Tablets
lg:  1024px  - Small desktops
xl:  1280px  - Desktops
2xl: 1536px  - Large desktops
```

### Fluid Typography

```css
/* Scales smoothly between viewport sizes */
font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
         /* min,  preferred,      max */
```

### Content Choreography

```
Desktop:  [Sidebar] [Main Content]
Tablet:   [Main Content]
          [Sidebar below]
Mobile:   [Main Content]
          [Sidebar hidden/collapsed]
```

---

## 🎬 Motion & Animation Principles

### 12 Principles of Animation (Disney-დან)

**ვებისთვის ყველაზე მნიშვნელოვანი:**

1. **Ease-in/Ease-out:** ბუნებრივი მოძრაობა
2. **Anticipation:** მცირე მოძრაობა action-მდე
3. **Follow-through:** მოძრაობის დასრულება
4. **Secondary Action:** დამხმარე მოძრაობა

### Duration Guidelines

```
Micro-interactions:  100-150ms  (hover, focus)
Small transitions:   200-300ms  (dropdowns, toggles)
Medium transitions:  300-400ms  (modals, slides)
Large transitions:   400-600ms  (page transitions)
```

### Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
/* სწრაფი დასაწყისი, ნელი დასასრული - ყველაზე ბუნებრივი */

--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
/* ნელი დასაწყისი და დასასრული - formal */

--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
/* Playful overshoot */
```

### Motion Hierarchy

```
Primary actions:   ყველაზე შესამჩნევი animation
Secondary:         მცირე, დამხმარე
Background:        ძალიან subtle ან არ არის
```

---

## ♿ Accessibility Fundamentals

### Color Contrast (WCAG)

```
Normal text:   4.5:1 minimum
Large text:    3:1 minimum (18px+ or 14px bold)
UI components: 3:1 minimum

Tools: WebAIM Contrast Checker
```

### Focus States

```css
/* ყველა interactive ელემენტს უნდა ჰქონდეს */
:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
```

### Touch Targets

```
Minimum: 44×44px (iOS guideline)
Recommended: 48×48px (Material Design)
```

### Color-Blind Safe

```
❌ არ დაეყრდნო მხოლოდ ფერს
✅ გამოიყენე: icons + color, patterns + color
```

---

## 🎨 Color Theory Basics

### Color Relationships

```
Complementary:    საპირისპირო (high contrast)
Analogous:        მეზობელი (harmonious)
Triadic:          120° apart (vibrant)
Split-Complementary: safer than complementary
```

### 60-30-10 Rule

```
60%: Dominant color (backgrounds)
30%: Secondary color (surfaces, cards)
10%: Accent color (CTAs, highlights)
```

### Dark Theme Specifics

```
- არასოდეს pure black #000000
- Elevation = lighter, not darker
- Reduce saturation slightly
- Increase contrast for text
```

---

## 📋 Design Checklist (AI Prompt-ისთვის)

ახალი პლატფორმის დიზაინისას მოითხოვე:

```markdown
## Design System Requirements

### Foundation
- [ ] 8-point grid system
- [ ] Modular typography scale (ratio: 1.25 or 1.333)
- [ ] Color palette with semantic naming
- [ ] Spacing scale (4px base, or 8px)
- [ ] Border radius tokens
- [ ] Shadow system

### Rhythm & Layout
- [ ] Vertical rhythm (baseline grid)
- [ ] Horizontal rhythm (column grid)
- [ ] Consistent section spacing
- [ ] Container max-widths
- [ ] Responsive breakpoints

### Hierarchy
- [ ] 5-level text hierarchy
- [ ] Color hierarchy (foreground/muted/dim)
- [ ] Size hierarchy for components

### Components
- [ ] Button variants (primary, secondary, ghost)
- [ ] Form elements (input, select, checkbox)
- [ ] Cards with consistent padding
- [ ] Modals with backdrop
- [ ] Navigation patterns

### Accessibility
- [ ] WCAG AA contrast (4.5:1 text, 3:1 UI)
- [ ] Focus states
- [ ] Touch targets 44px+
- [ ] Semantic HTML

### Motion
- [ ] Easing functions
- [ ] Duration scale
- [ ] Interaction feedback

### Dark/Light Theme
- [ ] Surface elevation system
- [ ] Proper contrast in both modes
```

---

# Part 1.5: CZABA Design Philosophy

ეს სექცია ხსნის **რატომ** ავირჩიეთ კონკრეტული დიზაინ გადაწყვეტილებები. Part 1-ში ზოგადი პრინციპებია, აქ კი - CZABA-სთვის სპეციფიკური არჩევანები.

---

## რატომ Dark Theme?

### ბიზნეს მიზეზი
CZABA არის **კურატორული გალერეა კინემატოგრაფისტებისთვის**, არა "აუდიო ფაილების სუპერმარკეტი". Dark theme ქმნის:

| ეფექტი | აღწერა |
|--------|--------|
| **კინემატოგრაფიული განწყობა** | ფილმის მაყურებლის ასოციაცია - ბნელი დარბაზი, ეკრანზე ფოკუსირება |
| **პროდუქტის წინ წამოწევა** | მუქ ფონზე ნათელი ელემენტები უფრო გამოირჩევა |
| **Premium აღქმა** | Luxury ბრენდები ხშირად dark palette-ს იყენებენ |
| **თვალის დაღლილობა** | მუსიკის პროდიუსერები ხშირად ღამით მუშაობენ |

### ტექნიკური იმპლემენტაცია
```css
/* არასოდეს pure black - ძალიან მკვეთრია */
--color-background: hsl(220, 20%, 4%);   /* #0A0B0F - თითქმის შავი, მაგრამ თბილი */

/* Elevation = უფრო ნათელი (dark theme-ში!) */
--color-surface:  hsl(220, 18%, 8%);     /* Cards, modals */
--color-elevated: hsl(220, 18%, 12%);    /* Hover states */
```

**რატომ არა #000000?**
- Pure black (#000) ქმნის ძალიან მაღალ კონტრასტს თეთრ ტექსტთან
- ეს იწვევს თვალის დაღლილობას
- Subtle blue undertone (hsl 220) ქმნის "ცივ", კინემატოგრაფიულ შეგრძნებას

---

## რატომ Teal + Orange?

### Complementary Colors
Teal (#13D9CC) და Orange (#F9A80C) არის complementary ფერები ფერთა წრეზე:

```
                    🟡 Orange (38°)
                         │
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │           Color Wheel           │
        │                │                │
        └────────────────┼────────────────┘
                         │
                         │
                    🩵 Teal (175°)
```

| ფერი | გამოყენება | რატომ |
|------|------------|-------|
| **Teal (Brand)** | Primary CTA, links, focus states | სიცოცხლე, ტექნოლოგია, modern feel |
| **Orange (Accent)** | Secondary highlights, badges | ენერგია, creativity, warmth |

### 60-30-10 წესი CZABA-ში
```
60% - Dark backgrounds (background, surface)
30% - Text colors (foreground, muted, dim)
10% - Brand/Accent colors (Teal, Orange)
```

ეს პროპორცია უზრუნველყოფს რომ brand ფერები **გამოირჩეოდეს** და არ დაიკარგოს.

---

## რატომ Playfair Display + Inter?

### Font Pairing Logic

| Font | როლი | რატომ |
|------|------|-------|
| **Playfair Display** (Serif) | Headlines, titles | ელეგანტურობა, tradition, luxury აღქმა |
| **Inter** (Sans-serif) | Body text, UI | readability, modern, neutral |

### Serif სათაურებში = Premium Signal
```
"CINEMATIC MASTERPIECES"  ← Playfair - ელეგანტური
"Add to Cart"             ← Inter - ფუნქციონალური
```

Serif fonts ასოცირდება:
- ტრადიციულ ბეჭდურ მედიასთან
- Luxury ბრენდებთან (Vogue, Times)
- "დროის გამოცდილ" ხარისხთან

Sans-serif UI-სთვის:
- უკეთ იკითხება მცირე ზომებში
- ეკრანზე უფრო clear
- Modern, tech-savvy იმიჯი

---

## Semantic Colors - როდის რომელი?

### Text Colors - იერარქია

```
┌─────────────────────────────────────────────────────────────┐
│ --color-foreground (94% lightness)                          │
│ ● Headlines, primary content, CTAs                          │
│ ● ყველაზე მნიშვნელოვანი ინფორმაცია                           │
├─────────────────────────────────────────────────────────────┤
│ --color-muted (55% lightness)                               │
│ ● Descriptions, secondary text, labels                      │
│ ● მნიშვნელოვანი, მაგრამ არა მთავარი                          │
├─────────────────────────────────────────────────────────────┤
│ --color-dim (35% lightness)                                 │
│ ● Placeholders, hints, disabled states                      │
│ ● დამხმარე ინფორმაცია                                        │
└─────────────────────────────────────────────────────────────┘
```

### რეალური მაგალითი - Product Card

```tsx
// Product Card
<h3 className="text-foreground">          // სათაური - ყველაზე მნიშვნელოვანი
  Epic Cinematic Drums
</h3>
<p className="text-muted">                // აღწერა - secondary
  24 professional loops
</p>
<span className="text-dim">              // meta info
  WAV • 48kHz
</span>
<span className="text-brand">            // ფასი - action-oriented
  $49
</span>
```

### Background Colors - Elevation System

```
Page Background (background)
    │
    ├── Card (surface)
    │       │
    │       └── Hover State (elevated)
    │
    └── Modal Backdrop (blur + 95% black)
            │
            └── Modal Content (surface)
```

**წესი:** რაც უფრო "წინ" არის ელემენტი, მით უფრო ნათელი background.

### Semantic Colors - სცენარები

| სცენარი | ფერი | მაგალითი |
|---------|------|----------|
| **Success** | `--color-positive` (#00D26A) | "Added to cart", "Payment successful" |
| **Error** | `--color-destructive` | "Invalid email", "Payment failed" |
| **Warning** | `--color-warning` | "Limited stock", "Session expiring" |
| **Info** | `--color-info` | "New feature", tooltips |
| **Buy/Purchase** | `--color-buy` (#006AFF) | "Buy Now", checkout buttons |

---

## კომპონენტების იერარქია

### UI Folder Structure

```
app/components/ui/
├── Button.tsx          # Primary, Secondary, Ghost, Accent variants
├── IconButton.tsx      # Square buttons for icons only
├── Input.tsx           # Input, PasswordInput, Textarea
├── Card.tsx            # Card + CardHeader, CardContent, CardFooter
├── Modal.tsx           # Modal + ModalHeader, ModalBody, ModalFooter
├── Toast.tsx           # Notifications
└── EmptyState.tsx      # Empty lists, no results
```

### Import Pattern

```tsx
// ყველა UI კომპონენტი ერთი index-იდან
import {
  Button,
  PrimaryButton,
  GhostButton,
  IconButton,
  Input,
  PasswordInput,
  Card,
  CardHeader,
  CardContent,
  Modal,
  ModalHeader,
  ModalBody
} from '~/components/ui';
```

### კომპონენტების გამოყენების წესები

| კომპონენტი | როდის გამოიყენება | როდის არა |
|------------|-------------------|-----------|
| **Button** | Actions that do something | Navigation (use Link) |
| **IconButton** | Icon-only actions (close, menu) | Text + icon (use Button) |
| **Card** | Content containers | Simple dividers (use div) |
| **Modal** | User must take action | Informational popups (use Toast) |
| **Input** | Forms, data entry | Display-only text |

### Variant Selection Guide

```
Button variant არჩევა:

"ეს action რევენიუ მოაქვს?"
    │
    ├── კი → variant="primary" (Add to Cart, Buy Now)
    │
    └── არა
         │
         ├── "ეს secondary action-ია?" → variant="secondary" (Cancel, Back)
         │
         └── "ეს tertiary/link-ია?" → variant="ghost" (Learn More, Skip)
```

---

# Part 2: CZABA Implementation

(არსებული დოკუმენტაცია აქედან გრძელდება)

---

## 📊 Current Status

| Metric | Score | Status |
|--------|-------|--------|
| Design Tokens | 10/10 | ✅ Complete |
| Documentation | 10/10 | ✅ Complete |
| Component Refactor | 10/10 | ✅ Button, IconButton, Input, Card, Modal |
| WCAG Contrast | 10/10 | ✅ Fixed |
| CSS Cleanup | 10/10 | ✅ Unused classes removed |
| **Overall** | **10/10** | ✅ **Complete!** |

### რა დასრულდა:
- ✅ Design tokens @theme-ში
- ✅ Spacing scale (4px base, numeric tokens only)
- ✅ Animation tokens (duration, easing)
- ✅ Color system
- ✅ დოკუმენტაცია
- ✅ **Button კომპონენტი** (Primary, Secondary, Ghost, Accent, IconButton)
- ✅ **Input კომპონენტი** (Input, PasswordInput, Textarea)
- ✅ **Card კომპონენტი** (default, elevated, outline, interactive + sub-components)
- ✅ **Modal კომპონენტი** (Modal, ConfirmDialog + sub-components)
- ✅ Auth forms მიგრირებული ახალ კომპონენტებზე
- ✅ **WCAG AA Contrast Audit** (see `docs/design/wcag-audit.md`)
- ✅ **CSS Cleanup** - გამოუყენებელი კლასები წაშლილია

### შემდეგი ეტაპი (10/10):
- [x] Card component სტანდარტიზაცია
- [x] Modal component სტანდარტიზაცია

---

## 📐 Design Tokens

### Spacing Scale (4px Base)

```
--spacing-0:   0px
--spacing-1:   4px     (0.25rem)
--spacing-2:   8px     (0.5rem)
--spacing-3:   12px    (0.75rem)
--spacing-4:   16px    (1rem)
--spacing-5:   20px    (1.25rem)
--spacing-6:   24px    (1.5rem)
--spacing-8:   32px    (2rem)
--spacing-10:  40px    (2.5rem)
--spacing-12:  48px    (3rem)
--spacing-16:  64px    (4rem)
--spacing-20:  80px    (5rem)
--spacing-24:  96px    (6rem)
```

**Usage Rules:**
- Component padding: `spacing-4` to `spacing-6`
- Section padding: `spacing-12` to `spacing-20`
- Element gaps: `spacing-2` to `spacing-4`
- Card padding: `spacing-5` or `spacing-6`

---

### Typography Scale (1.25 Ratio)

```
--text-xs:    12px / 16px    (0.75rem)
--text-sm:    14px / 20px    (0.875rem)
--text-base:  16px / 24px    (1rem)       ← Default body
--text-lg:    20px / 28px    (1.25rem)
--text-xl:    24px / 32px    (1.5rem)
--text-2xl:   30px / 36px    (1.875rem)
--text-3xl:   36px / 40px    (2.25rem)
--text-4xl:   48px / 52px    (3rem)
--text-5xl:   60px / 64px    (3.75rem)
--text-6xl:   72px / 76px    (4.5rem)
```

**Font Families:**
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-serif: 'Playfair Display', Georgia, serif;
```

**Font Weights:**
```
Regular:    400
Medium:     500
Semibold:   600
Bold:       700
```

**Usage Rules:**
- Body text: `text-base`, `font-sans`, `weight-400`
- UI labels: `text-sm`, `font-sans`, `weight-500`
- Section titles: `text-2xl` to `text-4xl`, `font-serif`, `weight-600`
- Hero titles: `text-5xl` to `text-6xl`, `font-serif`, `weight-700`
- Buttons: `text-sm` to `text-base`, `font-sans`, `weight-600`

---

### Color System

#### Backgrounds (Dark Theme)
```css
--color-background:    hsl(220, 20%, 4%);     /* #0A0B0F - Page background */
--color-surface:       hsl(220, 18%, 8%);     /* #121318 - Cards, modals */
--color-elevated:      hsl(220, 18%, 12%);    /* #1A1B21 - Hover states, elevated */
```

#### Borders
```css
--color-outline:       hsl(220, 15%, 18%);    /* #292B33 - Default borders */
--color-outline-hover: hsl(220, 15%, 25%);    /* #3B3E47 - Hover borders */
```

#### Brand Colors
```css
--color-brand:         hsl(175, 85%, 46%);    /* #13D9CC - Primary actions */
--color-brand-hover:   hsl(175, 85%, 52%);    /* #1EEADB - Hover state */
--color-accent:        hsl(38, 95%, 55%);     /* #F9A80C - Secondary accent */
```

#### Text Colors
```css
--color-foreground:    hsl(220, 10%, 94%);    /* #EEEEF0 - Primary text */
--color-muted:         hsl(220, 10%, 55%);    /* #85858F - Secondary text */
--color-dim:           hsl(220, 10%, 35%);    /* #54545C - Disabled, hints */
```

#### Semantic Colors
```css
--color-positive:      #00D26A;               /* Success */
--color-destructive:   hsl(0, 84%, 60%);      /* Error, destructive */
--color-warning:       #F59E0B;               /* Warning */
--color-info:          #3B82F6;               /* Info */
```

#### Commerce Colors
```css
--color-buy:           #006AFF;               /* Buy buttons */
--color-buy-hover:     #0052CC;               /* Buy hover */
```

---

### Border Radius

```css
--radius-sm:    6px     (0.375rem)   /* Small elements, tags */
--radius-md:    8px     (0.5rem)     /* Buttons, inputs */
--radius-lg:    12px    (0.75rem)    /* Cards, modals */
--radius-xl:    16px    (1rem)       /* Large cards */
--radius-full:  9999px               /* Pills, avatars */
```

---

### Shadows

```css
--shadow-sm:    0 1px 2px hsl(220, 20%, 2%, 0.3);
--shadow-md:    0 4px 8px hsl(220, 20%, 2%, 0.4);
--shadow-lg:    0 8px 16px hsl(220, 20%, 2%, 0.5);
--shadow-xl:    0 16px 32px hsl(220, 20%, 2%, 0.6);
--shadow-glow:  0 0 20px hsl(175, 85%, 46%, 0.3);
```

---

### Animation

```css
/* Durations */
--duration-fast:    150ms
--duration-normal:  250ms
--duration-slow:    400ms

/* Easings */
--ease-out:         cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:      cubic-bezier(0.65, 0, 0.35, 1);
--ease-bounce:      cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Usage Rules:**
- Hover states: `duration-fast`, `ease-out`
- Modal open/close: `duration-normal`, `ease-out`
- Page transitions: `duration-slow`, `ease-in-out`
- Playful interactions: `ease-bounce`

---

## 🧱 Component Specifications

### Buttons

> **Component:** `app/components/ui/Button.tsx`
> **Import:** `import { Button, PrimaryButton, SecondaryButton, GhostButton } from '~/components/ui';`

#### Usage Examples

```tsx
// Primary - Revenue actions
<Button variant="primary" size="lg">Add to Cart</Button>

// Secondary - Supporting actions
<Button variant="secondary">Cancel</Button>

// Ghost - Tertiary actions
<Button variant="ghost" size="sm">Learn More</Button>

// With loading state
<Button isLoading={true}>Processing...</Button>

// Full width
<Button fullWidth>Submit</Button>

// Convenience exports
<PrimaryButton>Buy Now</PrimaryButton>
<SecondaryButton>Cancel</SecondaryButton>
<GhostButton>Skip</GhostButton>
```

#### Size Reference

| Size | Padding | Font | Use Case |
|------|---------|------|----------|
| `sm` | 12px 6px | text-sm | Inline actions, tags |
| `md` | 16px 10px | text-sm | Default, forms |
| `lg` | 24px 12px | text-base | Hero CTAs, modals |

#### Primary Button (Revenue Actions)
```css
background: var(--color-brand);
color: var(--color-background);
padding: 12px 24px;
border-radius: var(--radius-md);
font-weight: 600;
font-size: var(--text-sm);

/* Hover */
background: var(--color-brand-hover);
box-shadow: var(--shadow-glow);
```

**Use for:** Add to Cart, Buy Now, Submit, Primary CTA

#### Secondary Button (Supporting Actions)
```css
background: var(--color-elevated);
color: var(--color-foreground);
border: 1px solid var(--color-outline);
padding: 12px 24px;
border-radius: var(--radius-md);
font-weight: 500;

/* Hover */
background: var(--color-outline);
border-color: var(--color-outline-hover);
```

**Use for:** Cancel, Back, Secondary actions

#### Ghost Button (Tertiary Actions)
```css
background: transparent;
color: var(--color-muted);
padding: 8px 16px;
border-radius: var(--radius-md);
font-weight: 500;

/* Hover */
background: var(--color-elevated);
color: var(--color-foreground);
```

**Use for:** Links that look like buttons, Less important actions

### IconButton

> **Component:** `app/components/ui/IconButton.tsx`

```tsx
import { IconButton } from '~/components/ui';
import { X, Play, Settings } from 'lucide-react';

<IconButton label="Close" variant="ghost" size="md">
  <X size={20} />
</IconButton>
```

| Size | Dimensions | Icon Size |
|------|------------|-----------|
| `sm` | 32x32px | 16px |
| `md` | 40x40px | 20px |
| `lg` | 48x48px | 24px |

---

### Cards

> **Component:** `app/components/ui/Card.tsx`
> **Import:** `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui';`

#### Usage Examples

```tsx
// Basic Card
<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Short description</CardDescription>
  </CardHeader>
  <CardContent>Main content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>

// Interactive Card (for clickable items)
<Card variant="interactive" padding="lg">
  Click me
</Card>

// Elevated Card
<Card variant="elevated">Elevated content</Card>

// Card with semantic element
<Card as="article">Article content</Card>
```

#### Card Variants

| Variant | Background | Use Case |
|---------|------------|----------|
| `default` | surface + border | Standard cards |
| `elevated` | elevated + shadow | Prominent content |
| `outline` | transparent + 2px border | Form sections |
| `interactive` | surface + hover effects | Clickable cards |

#### Card Padding

| Size | Value | Use Case |
|------|-------|----------|
| `none` | 0 | Image cards |
| `sm` | 16px | Compact cards |
| `md` | 24px | Default |
| `lg` | 32px | Feature cards |

#### CSS Specifications
```css
/* Default Card */
background: var(--color-surface);
border: 1px solid var(--color-outline);
border-radius: var(--radius-lg);
padding: var(--spacing-6);

/* Interactive Hover */
border-color: var(--color-brand) / 30%;
box-shadow: var(--shadow-lg) var(--color-brand) / 5%;
```

---

### Form Elements

> **Component:** `app/components/ui/Input.tsx`
> **Import:** `import { Input, PasswordInput, Textarea } from '~/components/ui';`

#### Usage Examples

```tsx
// Basic Input
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>

// Password with visibility toggle
<PasswordInput
  label="Password"
  value={password}
  onChange={setPassword}
  error={errors.password}
/>

// Textarea
<Textarea
  label="Message"
  value={message}
  onChange={setMessage}
/>
```

#### Input Variants

| Variant | Background | Use Case |
|---------|------------|----------|
| `default` | surface | Standard forms |
| `filled` | elevated | Elevated contexts |

#### Input Sizes

| Size | Padding | Use Case |
|------|---------|----------|
| `md` | pt-6 pb-2 | Default |
| `lg` | pt-7 pb-2.5 | Large forms |

#### CSS Specifications
```css
background: var(--color-surface);
border: 2px solid var(--color-outline);
border-radius: var(--radius-md);
padding: 24px 16px 8px 16px;  /* Floating label space */
color: var(--color-foreground);

/* Focus */
border-color: var(--color-brand);
box-shadow: 0 0 0 4px hsl(175, 85%, 46%, 0.1);

/* Error */
border-color: var(--color-destructive);
```

---

### Modals

> **Component:** `app/components/ui/Modal.tsx`
> **Import:** `import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ConfirmDialog } from '~/components/ui';`

#### Usage Examples

```tsx
// Basic Modal
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Modal Title</ModalTitle>
    <ModalDescription>Optional description</ModalDescription>
  </ModalHeader>
  <ModalBody>
    Content goes here
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary">Submit</Button>
  </ModalFooter>
</Modal>

// Confirm Dialog (pre-built pattern)
<ConfirmDialog
  isOpen={isOpen}
  title="Delete item?"
  description="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
  onConfirm={handleDelete}
  onCancel={handleClose}
  isLoading={isDeleting}
  icon={<Trash2 className="w-7 h-7 text-muted" />}
/>
```

#### Modal Sizes

| Size | Width | Use Case |
|------|-------|----------|
| `sm` | 360px | Confirmations, alerts |
| `md` | 420px | Forms, auth (default) |
| `lg` | 560px | Complex forms |
| `xl` | 720px | Large content |

#### Modal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Controls visibility |
| `onClose` | function | - | Close handler |
| `size` | sm/md/lg/xl | md | Modal width |
| `showCloseButton` | boolean | true | Show X button |
| `closeOnBackdrop` | boolean | true | Close on backdrop click |
| `closeOnEscape` | boolean | true | Close on ESC key |

#### CSS Specifications
```css
/* Modal Container */
background: var(--color-surface);
border: 1px solid var(--color-outline);
border-radius: var(--radius-xl);
max-width: var(--max-width-modal);  /* 420px */
box-shadow: var(--shadow-xl);

/* Backdrop */
background: hsl(0, 0%, 0%, 0.95);
backdrop-filter: blur(8px);
```

---

## 📏 Layout Rules

### Container
```css
max-width: 1280px;
padding-inline: var(--spacing-4);  /* Mobile */
padding-inline: var(--spacing-6);  /* Desktop */
margin-inline: auto;
```

### Section Spacing
```css
padding-block: var(--spacing-16);  /* 64px top/bottom */
/* OR */
padding-block: var(--spacing-20);  /* 80px for hero sections */
```

### Grid Gaps
```css
/* Product grids */
gap: var(--spacing-6);  /* 24px */

/* Form elements */
gap: var(--spacing-4);  /* 16px */

/* Tight lists */
gap: var(--spacing-2);  /* 8px */
```

---

## ✅ Do's and Don'ts

### Colors
- ✅ Use `--color-brand` for primary actions
- ✅ Use `--color-muted` for secondary text
- ❌ Don't use pure white `#FFFFFF` for text (use `--color-foreground`)
- ❌ Don't use pure black `#000000` for backgrounds

### Typography
- ✅ Use `font-serif` (Playfair) only for headlines
- ✅ Use `font-sans` (Inter) for everything else
- ❌ Don't mix more than 2 font families
- ❌ Don't use font sizes outside the scale

### Spacing
- ✅ Use spacing tokens exclusively
- ✅ Prefer `spacing-4` and `spacing-6` for most cases
- ❌ Don't use arbitrary pixel values
- ❌ Don't use margins when padding works

### Borders
- ✅ Use `--color-outline` for default borders
- ✅ Use `--radius-lg` for cards
- ❌ Don't use borders thicker than 2px
- ❌ Don't mix border radius sizes in same component

---

## 🔄 Migration Guide

### From Old to New

```css
/* OLD */
padding: 1.5rem;
/* NEW */
padding: var(--spacing-6);

/* OLD */
font-size: 14px;
/* NEW */
font-size: var(--text-sm);

/* OLD */
color: #85858F;
/* NEW */
color: var(--color-muted);

/* OLD */
border-radius: 0.75rem;
/* NEW */
border-radius: var(--radius-lg);
```

---

## 📋 Checklist for New Components

Before creating a new component, verify:

- [ ] Uses only colors from the palette
- [ ] Uses only spacing from the scale
- [ ] Uses only font sizes from the scale
- [ ] Has hover/focus/active states
- [ ] Has disabled state if applicable
- [ ] Meets WCAG AA contrast (4.5:1 for text)
- [ ] Uses appropriate border radius
- [ ] Uses appropriate shadow
- [ ] Animations use standard easings
- [ ] Responsive on mobile

---

## 📁 File Structure

```
app/
├── styles/
│   └── app.css              ← @theme tokens (source of truth)
docs/
└── design/
    ├── DESIGN_SYSTEM.md     ← This file (specification)
    └── design-systems-reference.md  ← Inspiration/research
```

---

## 🏷️ Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2026-01-18 | Added Part 1.5: CZABA Design Philosophy - Dark Theme rationale, Color psychology (Teal+Orange), Font pairing logic, Semantic colors usage guide, Component hierarchy |
| 2.0 | 2025-01-05 | Added Design Foundations (Part 1): Visual Rhythm, 8pt Grid, Gestalt Principles, Hierarchy, Whitespace, Reading Patterns, Balance, Motion, Accessibility, Color Theory, AI Prompt Checklist |
| 1.0 | 2025-01-03 | Initial design system specification |
