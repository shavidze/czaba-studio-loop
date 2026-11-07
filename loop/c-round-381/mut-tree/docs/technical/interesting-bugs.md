# საინტერესო ბაგები და გამოსწორებები

ეს დოკუმენტი აღწერს პროექტში აღმოჩენილ საინტერესო ბაგებს და მათ გამოსწორებებს.

---

## 1. Modal-ში Mouse Wheel Scroll არ მუშაობს

**სიმპტომი:** Modal-ში scrollbar-ის drag მუშაობს, მაგრამ mouse wheel არა.

**მიზეზი:** Lenis smooth scroll ბიბლიოთეკა გლობალურად იჭერს wheel events-ს.

**გამოსწორება:** `data-lenis-prevent` ატრიბუტი modal-ის ელემენტებზე.

```tsx
// app/components/ui/Modal.tsx
<div
  data-lenis-prevent  // ეს ეუბნება Lenis-ს არ ჩაერიოს
  className="fixed inset-0 ..."
>
  <div
    data-lenis-prevent  // modal content-ზეც
    className="... overflow-auto ..."
  >
```

**ფაილი:** `app/components/ui/Modal.tsx`

---

## 2. Modal-ში შიდა Scroll საერთოდ არ მუშაობს

**სიმპტომი:** Modal-ის content არ სქროლავს, მიუხედავად `overflow-auto`-სი.

**მიზეზი:** Backdrop-ს ჰქონდა `overflow-hidden` რაც ბლოკავდა child elements-ის scroll-ს.

**გამოსწორება:** წაიშალა `overflow-hidden` backdrop-იდან.

```tsx
// არასწორი
className="fixed inset-0 ... overflow-hidden"

// სწორი
className="fixed inset-0 ..."
```

**ფაილი:** `app/components/ui/Modal.tsx`

---

## 3. Body Scroll არ იბლოკება Modal-ის გახსნისას

**სიმპტომი:** Modal გახსნილია, მაგრამ background-ზე scroll მაინც მუშაობს.

**მიზეზი:** `overflow: hidden` არ საკმარისი, `position: fixed` სჭირდება body-ს.

**გამოსწორება:** `useScrollLock` hook-ში position: fixed ტექნიკა.

```typescript
// app/hooks/useScrollLock.ts
if (isLocked) {
  document.body.style.setProperty('overflow', 'hidden', 'important');
  document.body.style.setProperty('position', 'fixed', 'important');
  document.body.style.setProperty('width', '100%', 'important');
  document.body.style.top = `-${window.scrollY}px`;
}
```

**ფაილი:** `app/hooks/useScrollLock.ts`

---

## 4. Studio გვერდზე ზედმეტი Scroll Space

**სიმპტომი:** ბოლო stem-ის შემდეგ ზედმეტი ცარიელი ადგილი სქროლავს.

**მიზეზი:** ორი CSS წესი:
1. `.page-transition-wrapper` - `min-height: 100vh`
2. `body` - `padding-bottom: 90px` (audio player-ისთვის)

**გამოსწორება:** Studio-სთვის override-ები:

```css
/* app/styles/app.css */
.page-transition-wrapper:has(.studio-container) {
  min-height: auto;
}

body:has(.studio-container) {
  padding-bottom: 0;
}
```

**ფაილი:** `app/styles/app.css`

---

## 5. Zoom Drag-ისას ტექსტი მოინიშნება

**სიმპტომი:** TransportBar-ზე drag-ით zoom-ისას გვერდზე ტექსტი მოინიშნება.

**მიზეზი:** Drag event არ აჩერებს default text selection-ს.

**გამოსწორება:** `e.preventDefault()` და `userSelect: none`.

```typescript
// app/components/studio/TransportBar.tsx
const handleZoomDragStart = (e: React.MouseEvent) => {
  e.preventDefault();
  document.body.style.userSelect = 'none';
  // ...
};
```

**ფაილი:** `app/components/studio/TransportBar.tsx`

---

## 6. Scrollbar ისრები კუთხეებში ცუდად ჩანს

**სიმპტომი:** მომრგვალებულ modal-ში scrollbar-ის up/down ისრები არღვევს ესთეტიკას.

**მიზეზი:** WebKit scrollbar-ს default-ად აქვს buttons.

**გამოსწორება:**

```css
/* app/styles/base/utilities.css */
.styled-scrollbar::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.styled-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}
```

**ფაილი:** `app/styles/base/utilities.css`

---

## გამოყენებული ტექნიკები

| პრობლემა | ტექნიკა |
|----------|---------|
| Lenis scroll blocking | `data-lenis-prevent` attribute |
| Body scroll lock | `position: fixed` + scroll position save/restore |
| CSS cascade override | `:has()` selector |
| Text selection prevention | `userSelect: none` + `e.preventDefault()` |
| Scrollbar customization | `::-webkit-scrollbar-*` pseudo-elements |
