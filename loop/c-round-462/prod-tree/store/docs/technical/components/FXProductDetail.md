# FX პროდუქტის დეტალების კომპონენტები

Sound Effects პროდუქტის გვერდზე დამატებითი სექციები. ეს კომპონენტები ჩნდება **მხოლოდ** როცა პროდუქტის ტიპი არის "Sound Effects".

## ფაილები

- `app/components/product/fx/FXPackFeatures.tsx` - სტატისტიკის grid
- `app/components/product/fx/FXSoundPreviewGrid.tsx` - ხმების preview grid
- `app/components/product/fx/FXWhatsIncluded.tsx` - ტექნიკური სპეციფიკაციები
- `app/components/product/fx/index.ts` - ექსპორტები

---

## FXPackFeatures.tsx

### მოკლე აღწერა
სტატისტიკის grid რომელიც აჩვენებს ძირითად მეტრიკებს: ხმების რაოდენობა, ფორმატი, royalty status.

### Interface

```typescript
interface FXPackFeaturesProps {
  soundCount: number;         // ხმების რაოდენობა (მაგ: 50)
  format: string;             // "WAV", "MP3", etc.
  quality: string;            // "24bit / 96kHz"
  isRoyaltyFree?: boolean;    // Royalty-free თუ არა (default: true)
}
```

### კოდის ახსნა ხაზ-ხაზ

```tsx
// ხაზი 19-32: Features მასივის აწყობა props-დან
const features = [
  {
    value: soundCount.toString(),   // "50"
    label: 'Original Sounds',
  },
  {
    value: format.toUpperCase(),    // "WAV"
    label: quality,                 // "24bit / 96kHz"
  },
  {
    value: isRoyaltyFree ? '100%' : 'Limited',
    label: 'Royalty Free',
  },
];
```

**რატომ მასივი?** - map-ით უფრო სუფთად რენდერდება 3 ერთნაირი ელემენტი.

---

```tsx
// ხაზი 35-48: UI რენდერი
<div className="bg-black/50 border border-neutral-800 rounded-xl p-6">
  <div className="grid grid-cols-3 gap-4">
    {features.map((feature, index) => (
      <div key={index} className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">
          {feature.value}
        </div>
        <div className="text-sm text-neutral-400 tracking-wide">
          {feature.label}
        </div>
      </div>
    ))}
  </div>
</div>
```

**სტილი:**
- `bg-black/50` - ნახევრად გამჭვირვალე შავი
- `text-teal-400` - მნიშვნელობა teal ფერით ხაზგასმულია
- `grid-cols-3` - 3 სვეტიანი grid

---

## FXSoundPreviewGrid.tsx

### მოკლე აღწერა
ხმების preview grid. თითოეულ ხმაზე დაკლიკებით იწყება დაკვრა.

### Interfaces

```typescript
// ერთი ხმის ობიექტი
export interface FXSound {
  id: string;
  name: string;          // "Impact_Heavy_01"
  duration: string;      // "0:03"
  audioUrl: string;      // preview audio URL
  category?: string;     // "Impact", "Whoosh", etc.
}

interface FXSoundPreviewGridProps {
  sounds: FXSound[];
  maxDisplay?: number;   // მაქსიმუმ რამდენი გამოჩნდეს (default: 12)
}
```

### State

```typescript
const [playingId, setPlayingId] = useState<string | null>(null);  // რომელი უკრავს
const audioRef = useRef<HTMLAudioElement | null>(null);           // მიმდინარე audio
```

### კოდის ახსნა ხაზ-ხაზ

```tsx
// ხაზი 26-48: handlePlay ფუნქცია
const handlePlay = useCallback((sound: FXSound) => {
  // თუ რაღაც უკრავს - გააჩერე
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
  }

  // თუ იგივე ხმაზე დავაჭირეთ - მხოლოდ გაჩერება
  if (playingId === sound.id) {
    setPlayingId(null);
    return;
  }

  // ახალი audio შექმნა
  const audio = new Audio(sound.audioUrl);

  // როცა დამთავრდება - state გასუფთავება
  audio.addEventListener('ended', () => {
    setPlayingId(null);
    audioRef.current = null;
  });

  audio.play();
  audioRef.current = audio;
  setPlayingId(sound.id);
}, [playingId]);
```

**მნიშვნელოვანი:**
- `useCallback` - ოპტიმიზაცია, ყოველ რენდერზე ახალი ფუნქცია არ იქმნება
- `playingId` dependency - ფუნქცია განახლდება როცა playingId იცვლება

---

```tsx
// ხაზი 50-51: მონაცემების slice და დარჩენილის დათვლა
const displayedSounds = sounds.slice(0, maxDisplay);
const remainingCount = sounds.length - maxDisplay;
```

**რატომ?** - თუ 50 ხმაა, მხოლოდ 12 გამოჩნდეს, დანარჩენისთვის "38 more" წერია.

---

```tsx
// ხაზი 66-111: ხმის ღილაკი
<button
  key={sound.id}
  onClick={() => handlePlay(sound)}
  className={`group relative flex items-center gap-3 p-3 rounded-lg border
              transition-all duration-200 ${
    isPlaying
      ? 'bg-teal-500/20 border-teal-500 text-teal-400'     // უკრავს
      : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700' // ჩერდება
  }`}
>
```

**სტილი:** უკრავს თუ არა განსხვავებული:
- უკრავს: teal ფონი და border
- ჩერდება: neutral ფონი, hover-ზე border ნათელდება

---

```tsx
// ხაზი 79-87: Play/Pause აიქონი
<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                 transition-colors ${
  isPlaying ? 'bg-teal-500 text-black' : 'bg-neutral-800 group-hover:bg-neutral-700'
}`}>
  {isPlaying ? (
    <Pause size={14} fill="currentColor" />
  ) : (
    <Play size={14} fill="currentColor" className="ml-0.5" />
  )}
</div>
```

**დეტალი:** `ml-0.5` Play აიქონზე - ვიზუალურად ცენტრირებისთვის (Play arrow ოდნავ მარცხნივაა).

---

```tsx
// ხაზი 100-108: Playing ინდიკატორი (equalizer bars)
{isPlaying && (
  <div className="absolute top-1 right-1">
    <div className="flex gap-0.5">
      <div className="w-0.5 h-3 bg-teal-400 animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-0.5 h-3 bg-teal-400 animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-0.5 h-3 bg-teal-400 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
)}
```

**ეფექტი:** 3 ბარი სხვადასხვა delay-ით პულსირებს - equalizer ანიმაცია.

---

```tsx
// ხაზი 115-119: "დარჩენილი ხმები" ტექსტი
{remainingCount > 0 && (
  <div className="text-center text-sm text-neutral-500 py-2">
    + {remainingCount} more sounds included in full pack
  </div>
)}
```

**UX:** მომხმარებელს ეცოდინება რომ preview არ არის სრული.

---

## FXWhatsIncluded.tsx

### მოკლე აღწერა
ტექნიკური სპეციფიკაციები: ფორმატები, ხარისხი, თავსებადობა.

### Interface

```typescript
interface FXWhatsIncludedProps {
  formats: string[];          // ["WAV", "MP3"]
  quality: string;            // "24bit / 96kHz"
  fileSize: string;           // "2.3 GB"
  compatibility?: string[];   // ["Premiere Pro", "Final Cut", ...]
  categories?: string[];      // ["Impact", "Whoosh", "Foley"]
}
```

### კოდის ახსნა ხაზ-ხაზ

```tsx
// ხაზი 20-22: Default values
compatibility = ['Premiere Pro', 'Final Cut', 'DaVinci Resolve', 'Any DAW'],
categories = [],
```

**რატომ default?** - თუ Shopify-დან არ მოვიდა, სტანდარტული list გამოჩნდეს.

---

```tsx
// ხაზი 31-53: File Specifications კარტი
<div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
  <div className="flex items-center gap-2 text-white font-medium">
    <FileAudio size={18} className="text-teal-400" />
    File Specifications
  </div>

  <div className="space-y-3">
    <div className="flex justify-between text-sm">
      <span className="text-neutral-400">Format</span>
      <span className="text-white font-medium">{formats.join(', ')}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-neutral-400">Quality</span>
      <span className="text-white font-medium">{quality}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-neutral-400">Total Size</span>
      <span className="text-white font-medium">{fileSize}</span>
    </div>
  </div>
</div>
```

**Layout:** label მარცხნივ (neutral), value მარჯვნივ (white).

---

```tsx
// ხაზი 56-70: Compatibility list
<div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
  <div className="flex items-center gap-2 text-white font-medium">
    <Monitor size={18} className="text-teal-400" />
    Compatible With
  </div>

  <div className="space-y-2">
    {compatibility.map((software, index) => (
      <div key={index} className="flex items-center gap-2 text-sm">
        <Check size={14} className="text-teal-400" />
        <span className="text-neutral-300">{software}</span>
      </div>
    ))}
  </div>
</div>
```

**აიქონი:** Check mark თითოეული software-ის წინ - "მუშაობს აქ" ვიბე.

---

```tsx
// ხაზი 74-89: Categories pills (optional)
{categories.length > 0 && (
  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
    <div className="text-white font-medium">Sound Categories</div>
    <div className="flex flex-wrap gap-2">
      {categories.map((category, index) => (
        <span
          key={index}
          className="px-3 py-1.5 text-sm bg-neutral-800 text-neutral-300 rounded-full"
        >
          {category}
        </span>
      ))}
    </div>
  </div>
)}
```

**სტილი:** pill badges flex-wrap-ით - თუ ბევრია ქვევით ჩამოეშვება.

---

## ProductDetailPage-ში ინტეგრაცია

```tsx
// app/components/product/ProductDetailPage.tsx

// შემოწმება არის თუ არა Sound Effects პროდუქტი
const isFXProduct = product.productType === 'Sound Effects';

// მონაცემების ამოღება metafields-დან
const fxData = isFXProduct ? {
  soundCount: getMetafield(product.metafields, 'sound_count') || 50,
  format: getMetafield(product.metafields, 'format') || 'WAV',
  quality: getMetafield(product.metafields, 'quality') || '24bit / 96kHz',
  // ... სხვა მონაცემები
} : null;

// რენდერი (მხოლოდ თუ FX პროდუქტია)
{isFXProduct && fxData && (
  <>
    <FXPackFeatures
      soundCount={fxData.soundCount}
      format={fxData.format}
      quality={fxData.quality}
      isRoyaltyFree={true}
    />

    {fxData.sounds && fxData.sounds.length > 0 && (
      <FXSoundPreviewGrid sounds={fxData.sounds} maxDisplay={12} />
    )}

    <FXWhatsIncluded
      formats={['WAV', 'MP3']}
      quality={fxData.quality}
      fileSize="2.3 GB"
    />
  </>
)}
```

---

## Shopify Metafields რომლებსაც ეს კომპონენტები იყენებენ

| Metafield Key | Type | აღწერა |
|---------------|------|--------|
| `custom.sound_count` | Integer | ხმების რაოდენობა პაკეტში |
| `custom.format` | Single line text | "WAV", "MP3", etc. |
| `custom.quality` | Single line text | "24bit / 96kHz" |
| `custom.file_size` | Single line text | "2.3 GB" |
| `custom.categories` | List of text | კატეგორიების სია |

**შენიშვნა:** `sound_count` ემატება Shopify-ს მხარეს bundle/pack პროდუქტებისთვის.

---

## Lucide აიქონები რომლებსაც ვიყენებთ

| აიქონი | გამოყენება |
|--------|------------|
| `Play` | დაკვრის ღილაკი |
| `Pause` | პაუზის ღილაკი |
| `Volume2` | ხმის preview header |
| `FileAudio` | File specifications header |
| `Check` | Compatibility checkmark |
| `Monitor` | Compatible With header |
| `Download` | What's Included header |

---

## ბოლო განახლება
2025-12-28
