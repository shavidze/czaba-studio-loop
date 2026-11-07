# SFX კოლექციის კომპონენტები

Filmcrux-ით შთაგონებული კინემატიკური დიზაინის კომპონენტები Sound Effects კოლექციისთვის.

## ფაილები

- `app/components/sfx/SFXHero.tsx` - Hero სექცია 3D ეფექტით
- `app/components/sfx/SFXPackCard.tsx` - პაკეტის ბარათი hover ეფექტებით
- `app/components/sfx/index.ts` - ექსპორტები

---

## SFXHero.tsx

### მოკლე აღწერა
Hero სექცია SFX კოლექციისთვის. შეიცავს featured პაკეტის 3D მოკაპ ილუზიას და CTA ღილაკებს.

### Interface

```typescript
interface SFXHeroProps {
  featuredPack?: {
    title: string;       // პაკეტის სახელი
    subtitle: string;    // "Sound Effects Library"
    description: string; // აღწერა
    image: string;       // სურათის URL
    handle: string;      // პროდუქტის handle ლინკისთვის
    price: string;       // ფასი "$29"
  };
}
```

### კოდის ახსნა ხაზ-ხაზ

```tsx
// ხაზი 22-29: Default მონაცემები თუ featuredPack არ გადმოვიდა
const pack = featuredPack || {
  title: 'CINEMATIC IMPACTS',
  subtitle: 'Sound Effects Library',
  description: 'Professional cinematic sound effects...',
  image: '/images/fx-hero-placeholder.jpg',
  handle: 'cinematic-impacts',
  price: '$29',
};
```

**რატომ?** - Loader-დან თუ არ მოვიდა მონაცემები, მაინც რაღაც გამოჩნდეს.

---

```tsx
// ხაზი 32: მთავარი section - min-height 70vh
<section className="relative bg-black min-h-[70vh] flex items-center overflow-hidden">
```

**რატომ 70vh?** - Hero უნდა იკავებდეს ეკრანის დიდ ნაწილს, მაგრამ არა მთელს.

---

```tsx
// ხაზი 34: Background gradient - შავიდან neutral-950-მდე
<div className="absolute inset-0 bg-gradient-to-b from-black via-black to-neutral-950" />
```

**ეფექტი:** ქვევით ცოტა ნათელდება, რათა შემდეგ სექციასთან გადასვლა რბილი იყოს.

---

```tsx
// ხაზი 37-44: Grid pattern overlay
<div
  className="absolute inset-0 opacity-5"
  style={{
    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: '50px 50px',
  }}
/>
```

**ეფექტი:** ტექნიკური grid ხაზები 50x50px, ძალიან ოდნავ ჩანს (opacity-5).

---

```tsx
// ხაზი 47: Glow effect - teal ფერის რბილი სინათლე ცენტრში
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[150px]" />
```

**ეფექტი:** 800px წრე blur-ით, ქმნის რბილ ambient გლოუს.

---

```tsx
// ხაზი 54-55: Shadow/Glow პაკეტის სურათის უკან
<div className="absolute inset-0 bg-teal-500/20 rounded-2xl blur-3xl transform scale-90" />
```

**ეფექტი:** სურათს აქვს teal "გლოუ" უკან - ყურადღებას იპყრობს.

---

```tsx
// ხაზი 58: Hover scale ეფექტი
<div className="relative transform hover:scale-105 transition-transform duration-500">
```

**ინტერაქცია:** მაუსით დადებისას ოდნავ იზრდება (105%).

---

```tsx
// ხაზი 80-88: "Stacked effect" - 3D სიღრმის ილუზია
<div
  className="absolute -z-10 top-4 -left-4 w-full h-full rounded-2xl border border-neutral-800/50"
  style={{ background: 'linear-gradient(145deg, #151515 0%, #080808 100%)' }}
/>
<div
  className="absolute -z-20 top-8 -left-8 w-full h-full rounded-2xl border border-neutral-800/30"
  style={{ background: 'linear-gradient(145deg, #121212 0%, #060606 100%)' }}
/>
```

**ეფექტი:** ორი დამატებითი ფენა მთავარი სურათის უკან:
- პირველი: 4px ზევით, 4px მარცხნივ
- მეორე: 8px ზევით, 8px მარცხნივ
- ქმნის "დასტა ბარათების" ილუზიას

---

```tsx
// ხაზი 95-97: Badge "Sound Effects"
<div className="inline-block px-4 py-1.5 bg-teal-500/10 border border-teal-500/30
                rounded-full text-teal-400 text-sm tracking-[0.2em] uppercase mb-6">
  Sound Effects
</div>
```

**სტილი:** tracking-[0.2em] = ასოებს შორის დიდი დაშორება, კინემატიკური ვიბე.

---

```tsx
// ხაზი 109-121: CTA ღილაკები
<Link
  to="/collections/sfx"
  className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-semibold
             rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-teal-500/25"
>
  Browse All Packs
</Link>
<Link
  to={`/products/${pack.handle}`}
  className="px-8 py-4 border border-neutral-700 hover:border-neutral-600 text-white rounded-lg"
>
  View Featured Pack
</Link>
```

**პატერნი:** პირველადი (filled teal) + მეორადი (ghost) ღილაკი.

---

## SFXPackCard.tsx

### მოკლე აღწერა
პაკეტის ბარათი გრიდში. აქვს preview audio დაკვრის ფუნქცია და hover ეფექტები.

### Interface

```typescript
interface SFXPackCardProps {
  pack: {
    id: string;
    title: string;
    handle: string;       // პროდუქტის ლინკი
    image: string;
    price: string;        // "$29"
    soundCount?: number;  // რამდენი ხმაა პაკეტში
    category?: string;    // "Impact", "Whoosh", etc.
    previewUrl?: string;  // Audio preview URL
  };
}
```

### State

```typescript
const [isPlaying, setIsPlaying] = useState(false);   // უკრავს თუ არა preview
const [isHovered, setIsHovered] = useState(false);   // hover სტატუსი
const audioRef = useRef<HTMLAudioElement | null>(null); // მიმდინარე audio
```

### კოდის ახსნა ხაზ-ხაზ

```tsx
// ხაზი 28-49: Preview audio-ს მართვა
const handlePreviewClick = (e: React.MouseEvent) => {
  e.preventDefault();      // Link-ის default ქცევა გაუქმდეს
  e.stopPropagation();     // Click არ გადავიდეს parent-ზე (Link)

  if (!pack.previewUrl) return;

  // თუ უკვე უკრავს - გააჩერე
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
    setIsPlaying(false);
    return;
  }

  // ახალი audio შექმნა და დაკვრა
  const audio = new Audio(pack.previewUrl);
  audio.addEventListener('ended', () => {
    setIsPlaying(false);
    audioRef.current = null;
  });
  audio.play();
  audioRef.current = audio;
  setIsPlaying(true);
};
```

**მნიშვნელოვანი:** `e.preventDefault()` + `e.stopPropagation()` საჭიროა, რომ Play ღილაკზე დაკლიკება არ გადაგიყვანოთ პროდუქტის გვერდზე.

---

```tsx
// ხაზი 51-57: Link wrapper მთელ ბარათზე
<Link
  to={`/products/${pack.handle}`}
  className="group block"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
```

**რატომ `group`?** - Tailwind-ში `group` საშუალებას იძლევა შვილ ელემენტებზე `group-hover:` გამოვიყენოთ.

---

```tsx
// ხაზი 58: მთავარი კონტეინერი
<div className="relative bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden
                transition-all duration-300 hover:border-neutral-700
                hover:shadow-xl hover:shadow-black/50">
```

**Hover ეფექტი:** border ნათელდება, shadow ჩნდება.

---

```tsx
// ხაზი 69: სურათის zoom ეფექტი hover-ზე
<img
  src={pack.image}
  alt={pack.title}
  className="w-full h-full object-cover transition-transform duration-500
             group-hover:scale-110"
/>
```

**ეფექტი:** სურათი იზრდება 110%-მდე hover-ზე (slow transition 500ms).

---

```tsx
// ხაზი 79: Overlay gradient
<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent
                opacity-60 group-hover:opacity-80 transition-opacity" />
```

**ეფექტი:** ქვემოდან ზევით გრადიენტი, hover-ზე უფრო მუქდება.

---

```tsx
// ხაზი 82-88: Category badge
{pack.category && (
  <div className="absolute top-3 left-3">
    <span className="px-2 py-1 text-[10px] font-medium tracking-wider uppercase
                     bg-black/60 border border-neutral-700/50 text-neutral-300 rounded">
      {pack.category}
    </span>
  </div>
)}
```

**პოზიცია:** ზედა მარცხენა კუთხე, პატარა პილ.

---

```tsx
// ხაზი 91-110: Preview ღილაკი
{pack.previewUrl && (
  <button
    onClick={handlePreviewClick}
    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200 ${
      isPlaying
        ? 'bg-teal-500 text-black'  // უკრავს - teal ფონი
        : 'bg-black/60 border border-neutral-700/50 text-white hover:bg-teal-500 hover:text-black'
    }`}
  >
    {isPlaying ? (
      // ანიმირებული ბარები (equalizer ეფექტი)
      <div className="flex gap-0.5">
        <div className="w-0.5 h-3 bg-current animate-pulse" />
        <div className="w-0.5 h-3 bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-0.5 h-3 bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    ) : (
      <Play size={16} fill="currentColor" className="ml-0.5" />
    )}
  </button>
)}
```

**ვიზუალი:**
- დაკვრისას: 3 პულსირებადი ბარი (equalizer effect)
- გაჩერებული: Play აიქონი

---

```tsx
// ხაზი 113-119: Sound count badge
{pack.soundCount && (
  <div className="absolute bottom-3 left-3">
    <span className="px-2 py-1 text-xs font-medium
                     bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded">
      {pack.soundCount} sounds
    </span>
  </div>
)}
```

**პოზიცია:** ქვედა მარცხენა კუთხე, teal სტილით.

---

```tsx
// ხაზი 124-133: ინფო სექცია (სახელი + ფასი)
<div className="p-4">
  <h3 className="text-white font-semibold text-sm tracking-wide mb-1
                 group-hover:text-teal-400 transition-colors truncate">
    {pack.title}
  </h3>
  <div className="flex items-center justify-between">
    <span className="text-lg font-bold text-white">{pack.price}</span>
    <span className="text-xs text-neutral-500 uppercase tracking-wider
                     opacity-0 group-hover:opacity-100 transition-opacity">
      View Pack
    </span>
  </div>
</div>
```

**ეფექტები:**
- სათაური teal ხდება hover-ზე
- "View Pack" ჩნდება მხოლოდ hover-ზე

---

## გამოყენების მაგალითი

```tsx
// routes/collections.sfx.tsx
import { SFXHero, SFXPackCard } from '~/components/sfx';

// Hero სექცია
<SFXHero featuredPack={{
  title: 'CINEMATIC IMPACTS',
  subtitle: 'Sound Effects Library',
  description: 'Professional cinematic sound effects...',
  image: '/images/hero.jpg',
  handle: 'cinematic-impacts',
  price: '$29',
}} />

// პაკეტების Grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {assets.map((asset) => (
    <SFXPackCard
      key={asset.id}
      pack={{
        id: asset.id,
        title: asset.title,
        handle: asset.handle,
        image: asset.image,
        price: asset.price,
        soundCount: asset.soundCount,
        category: asset.category,
        previewUrl: asset.previewUrl,
      }}
    />
  ))}
</div>
```

---

## CSS კლასები რომლებსაც ეს კომპონენტები იყენებენ

| კლასი | აღწერა |
|-------|--------|
| `blur-[150px]` | Custom blur გლოუსთვის |
| `tracking-[0.2em]` | ფართო ასოთა დაშორება |
| `group` / `group-hover:` | Parent hover-ის მოსმენა |
| `animate-pulse` | პულსირება equalizer-ისთვის |

---

## ბოლო განახლება
2025-12-28
