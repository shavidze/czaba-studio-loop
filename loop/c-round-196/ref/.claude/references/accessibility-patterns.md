# Accessibility Implementation Patterns

## Color Contrast (WCAG 1.4.3)

**CZABA ფერები შესამოწმებლად:**
```
text-foreground (#F9FAFB) on bg-background (#0A0A0B)  → OK
text-muted (#9CA3AF) on bg-background (#0A0A0B)       → შეამოწმე!
text-dim (#6B7280) on bg-surface (#141415)            → შეამოწმე!
bg-brand (#13D9CC) on dark backgrounds                → შეამოწმე!
bg-accent (#F9A80C) on dark backgrounds               → შეამოწმე!
```

## Keyboard Navigation Patterns

```typescript
// Keyboard handler pattern
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowLeft':
      seekBackward(5);
      break;
    case 'ArrowRight':
      seekForward(5);
      break;
    case 'Escape':
      close();
      break;
  }
};
```

## Screen Reader Patterns

```typescript
// Waveform slider
<div
  role="slider"
  aria-label="Audio waveform"
  aria-valuemin={0}
  aria-valuemax={duration}
  aria-valuenow={currentTime}
  aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
>

// Solo/Mute state
<button
  aria-pressed={isSoloed}
  aria-label={`Solo ${trackName}. Currently ${isSoloed ? 'soloed' : 'not soloed'}`}
>

// Audio player state
<div role="region" aria-label="Audio player" aria-live="polite">
  <span className="sr-only">
    {isPlaying ? 'Playing' : 'Paused'}: {trackTitle}
  </span>
</div>

// Studio waveform state
<div className="sr-only" aria-live="polite">
  Track: {stemName}.
  Duration: {formatTime(duration)}.
  {isMuted && 'Muted.'}
  {isSoloed && 'Soloed.'}
  Volume: {Math.round(volume * 100)} percent.
</div>
```

## ARIA Attributes

```typescript
// Buttons with icons only
<button aria-label="Close modal">
  <XIcon aria-hidden="true" />
</button>

// Loading states
<div aria-busy={isLoading} aria-live="polite">

// Expandable sections
<button aria-expanded={isOpen} aria-controls="panel-id">

// Dialogs
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>

// Play/Pause
<button
  aria-label={`${isPlaying ? 'Pause' : 'Play'} preview of ${trackTitle}`}
  aria-pressed={isPlaying}
>

// Cart
<button
  aria-label={`Add ${productTitle} to cart. Price: ${price} dollars`}
>
  Add to Cart
</button>
```

## Focus Management

```typescript
// Modal focus trap
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector('button, [tabindex="0"]');
    firstFocusable?.focus();
  }
}, [isOpen]);

// Return focus on close
useEffect(() => {
  return () => {
    previousActiveElement?.focus();
  };
}, []);
```

```css
/* Focus ring utilities */
focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background
```

## Semantic HTML Checklist

```html
<h1> → Page title (1 per page)
<h2> → Section titles
<h3> → Subsections

<header> → Site header
<nav>    → Navigation
<main>   → Main content
<aside>  → Sidebar (filters)
<footer> → Site footer

<ul>/<ol> → Product grids, track lists
<label for="id"> → Every input needs label
```
