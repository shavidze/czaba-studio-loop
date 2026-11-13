# Czaba Store — Style Guide

## დიზაინ ფილოსოფია

Czaba არის **cinematic audio assets** მაღაზია. დიზაინი ამ კონცეფციას ემსახურება:

- **Dark-first** — კინოთეატრის ასოციაცია, premium აღქმა
- **Product elevation** — მუქ ფონზე პროდუქტები გამოირჩევა
- **Professional trust** — მუსიკის პროდიუსერები გვიან ღამით მუშაობენ, მუქი თემა თვალს ზოგავს
- **Cinematic atmosphere** — glow ეფექტები, subtle ანიმაციები

---

## ფერების სისტემა

### Semantic ფერები

| კატეგორია | Token | აღწერა |
|-----------|-------|--------|
| **Surface** | `background` | გვერდის ფონი (#0E0D0C, warm obsidian) |
| | `surface` | ბარათები, მოდალები (#161412) |
| | `elevated` | Hover, აქტიური ელემენტები (#1D1A17) |
| **Text** | `foreground` | ძირითადი ტექსტი (#ECE6DA) |
| | `muted` | მეორეული ტექსტი (#A39B8E) |
| | `dim` | გამორთული, მინიშნებები (#928A7D) |
| **Interactive** | `brand` | Primary ღილაკები, ლინკები (#C9A46A Brass) |
| | `brand-hover` | Brand hover (#D9B87F) |
| | `accent` | სპეციალური ყურადღება (#C9A46A, brand-ის ტოლი) |
| | `buy` | შეძენის ღილაკი (#C9A46A, brand-ის ტოლი) |
| **Feedback** | `positive` | წარმატება (#8FA382) |
| | `destructive` | შეცდომა (#D2776A) |
| | `warning` | გაფრთხილება (#D9A35B) |
| | `info` | ინფორმაცია (#3B82F6) |

### ფერთა სქემა: 60-30-10

```
60% — მუქი ფონი (background, surface)
30% — ტექსტი (foreground, muted)
10% — brand (brass)
```

### Brass — ერთი თბილი აქცენტი

- **Brass (#C9A46A)** — ძირითადი მოქმედებები, ნავიგაცია, აქტიური მდგომარეობა; hover — #D9B87F
- `accent` და `buy` brand-ის ტოლია: მეორე აქცენტური ფერი აღარ არსებობს
- იერარქია ტონით და სიკაშკაშით იქმნება, არა მეორე ფერით

---

## Dark Mode სტრატეგია

### Warm Obsidian Neutrals

ყველა neutral ფერი თბილი obsidian საფეხურია — არა pure black:

```
background: #0E0D0C   — არა #000000
surface:    #161412   — არა #121212
elevated:   #1D1A17   — არა #1e1e1e
```

ეს ქმნის "თბილ" მუქ თემას, რომელიც კინემატოგრაფიულია.

### კონტრასტის იერარქია

```
background → surface → elevated → outline
  4%           8%        12%        22%
```

თითოეული საფეხური 4% ზრდა lightness-ში.

---

## Typography

### Font Families

| Font | გამოყენება | წონა |
|------|-----------|------|
| **Playfair Display** (serif) | სათაურები, hero | 700 Bold |
| **Inter** (sans-serif) | Body, UI, labels | 300–800 |

### წესები

1. **არასდროს 3+ font family** — მხოლოდ Playfair + Inter
2. **Playfair მხოლოდ სათაურებში** — `font-serif` class
3. **Inter ყველგან სხვაგან** — `font-sans` (default)
4. **არა Playfair 16px-ზე პატარა** — serif ფონტი ცუდად იკითხება პატარა ზომაში

### ტიპოგრაფიის სკალა (1.25 ratio)

```
text-xs:   12px / 16px  — tags, badges
text-sm:   14px / 20px  — UI labels, ნიმუშები
text-base: 16px / 24px  — body ტექსტი (default)
text-lg:   20px / 28px  — card titles
text-xl:   24px / 32px  — section subtitles
text-2xl:  30px / 36px  — section titles
text-3xl:  36px / 40px  — page titles
text-4xl:  48px / 52px  — hero titles
text-5xl:  60px / 64px  — hero XL
```

---

## ანიმაციის წესები

### Duration სკალა

| Token | Value | გამოყენება |
|-------|-------|-----------|
| `duration-fast` | 150ms | Hover, focus states |
| `duration-normal` | 250ms | Modals, transitions |
| `duration-slow` | 400ms | Page transitions, complex animations |

### Easing ფუნქციები

| Token | Value | გამოყენება |
|-------|-------|-----------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | ელემენტის გამოჩენა |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | შუალედური ტრანზიციები |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | ღილაკის click feedback |

### წესები

1. **არა 400ms-ზე მეტი** — გამონაკლისი: page transitions
2. **Hover ეფექტები 150ms** — სწრაფი რეაგირება
3. **არა `linear` easing** — ყოველთვის ease ფუნქცია
4. **`prefers-reduced-motion` პატივისცემა** — ანიმაციები გამორთვადი

### Hover ეფექტები

```
hover-lift:   translateY(-2px) + shadow — ბარათები
hover-glow:   box-shadow brand color — interactive ელემენტები
hover-scale:  scale(1.02) — thumbnails
hover-border: border-color transition — inputs, cards
```

---

## Accessibility სტანდარტები (WCAG AA)

### კონტრასტი

| კატეგორია | მინიმუმი | სტატუსი |
|-----------|---------|---------|
| ტექსტი (ნორმალური) | 4.5:1 | foreground on background |
| ტექსტი (დიდი, 18px+) | 3:1 | headings |
| UI კომპონენტები | 3:1 | borders, icons |
| dim ტექსტი | 3:1 | 45% lightness (განახლებული) |

### Touch Targets

- **მინიმუმი:** 44×44px
- **IconButton sm:** 32×32px (მხოლოდ desktop)
- **IconButton md:** 40×40px
- **IconButton lg:** 48×48px

### Focus States

```css
focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
```

- ყველა interactive ელემენტს უნდა ჰქონდეს ვიზუალური focus
- `ring-offset` background ფერით
- Tab ნავიგაცია სრულად მუშაობს

### Keyboard Navigation

- **ESC** — მოდალების დახურვა
- **Tab/Shift+Tab** — ფოკუსის ნავიგაცია
- **Enter/Space** — ღილაკის აქტივაცია
- **Arrow keys** — select, slider კონტროლები

---

## Hover/Focus/Active States

### ღილაკები

| State | ცვლილება |
|-------|---------|
| Default | ძირითადი ფერი |
| Hover | brightness ან darker shade + cursor:pointer |
| Focus | ring-2 ring-brand ring-offset-2 |
| Active | scale(0.98) — subtle press effect |
| Disabled | opacity-50 cursor-not-allowed |
| Loading | spinner + disabled state |

### ბარათები

| State | ცვლილება |
|-------|---------|
| Default | surface background, outline border |
| Hover | translateY(-2px) + shadow + border-outline-hover |
| Focus | ring-2 ring-brand |
| Active | translateY(0) — press effect |

### Inputs

| State | ცვლილება |
|-------|---------|
| Default | outline border |
| Hover | outline-hover border |
| Focus | outline-strong border + ring |
| Error | destructive border + error message |
| Disabled | opacity-50, background muted |

---

## Responsive Design

### Breakpoints

```
sm:  640px  — ტელეფონები (landscape)
md:  768px  — ტაბლეტები
lg:  1024px — პატარა desktop
xl:  1280px — desktop (container max-width)
2xl: 1536px — დიდი ეკრანები
```

### Mobile-First

ყოველთვის mobile → desktop მიმართულებით:

```tsx
<div className="p-4 md:p-6 lg:p-8" />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
```

### Container

```
max-width: 1280px
padding-inline: 1rem (mobile) → 1.5rem (desktop)
margin: 0 auto
```
