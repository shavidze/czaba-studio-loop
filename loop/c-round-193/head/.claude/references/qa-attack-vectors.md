# QA Attack Vectors Checklist

## 1. XSS (Cross-Site Scripting)

```
□ dangerouslySetInnerHTML — გამოიყენება? სად?
□ URL parameters — sanitized? (searchParams, path params)
□ User-generated content — product reviews, comments?
□ Third-party embeds — iframe, script tags?
□ SVG injection — inline SVG user content-იდან?
□ href="javascript:" — link-ებში?
```

**რა ეძებ:**
```tsx
// CRITICAL — XSS vector
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// CRITICAL — javascript: protocol
<a href={userProvidedUrl}>Click</a>
// თუ userProvidedUrl = "javascript:alert(1)"
```

## 2. Authentication & Token Security

```
□ Token storage — localStorage vs httpOnly cookie?
□ Token leak — console.log-ში? error message-ში? URL-ში?
□ Token refresh — 401 → refresh → retry logic მუშაობს?
□ Concurrent refresh — ორი request ერთდროულად 401 → double refresh?
□ Logout cleanup — ყველა token წაშლილია?
□ Auth state sync — tab-ებს შორის auth state synchronized?
□ Protected routes — URL-ით პირდაპირ შესვლა blocked?
□ Firebase token — server-ზე ვერიფიცირდება?
```

**რა ეძებ:**
```typescript
// CRITICAL — Token leak
console.log("auth response:", { accessToken, refreshToken });

// CRITICAL — Token in URL
window.location.href = `/api/download?token=${accessToken}`;

// BUG — No refresh race protection
async function refreshToken() {
  // ორი request ერთდროულად → ორი refresh → ერთი fail
  const response = await apiClient.refreshToken(refreshToken);
}
```

## 3. Cart & Checkout Vulnerabilities

```
□ Price manipulation — frontend-იდან ფასის გაგზავნა?
□ Negative quantity — quantity=-1 cart-ში?
□ Double add — სწრაფად ორჯერ დაკლიკება?
□ Cart sync — localStorage cart vs server cart?
□ Stale cart — product წაშლილია/ფასი შეცვლილია cart-ში ყოფნისას?
□ Checkout race — ორი tab-იდან ერთდროულად checkout?
□ Payment redirect — Stripe success URL tampering?
□ Session hijack — სხვის sessionId-ით cart manipulation?
```

## 4. Studio/Audio Vulnerabilities

```
□ Memory leak — AudioContext არ იხურება unmount-ზე?
□ AudioBuffer leak — buffers არ released?
□ Concurrent playback — ორი track ერთდროულად?
□ Seek beyond duration — position > duration?
□ Volume range — negative volume? > 1?
□ Offline stems — cached stems expired?
□ IndexedDB full — storage quota exceeded?
□ Export race — double export click?
□ WaveSurfer destroy — cleanup on unmount?
□ Large files — 100MB+ audio → browser crash?
```

## 5. Race Conditions & Timing

```
□ Double click submit — ფორმის ორჯერ submit
□ Rapid navigation — სწრაფი route switching → stale data
□ API abort — component unmount → pending request → setState on unmounted
□ Debounce gaps — search input → rapid typing → wrong results
□ Optimistic update rollback — mutation fails → UI inconsistent
```

**რა ეძებ:**
```typescript
// BUG — setState on unmounted component
useEffect(() => {
  fetchData().then(data => setData(data)); // component unmount → error
  // MISSING: cleanup / abort controller
}, []);

// BUG — No double-click protection
<button onClick={() => submitOrder()}>Checkout</button>
// სწრაფი double-click → ორი შეკვეთა
```

## 6. Data Validation Gaps

```
□ Email format — regex validation client-side?
□ Password — minimum length/complexity shown?
□ Search input — max length? special chars?
□ File upload — type validation? size limit?
□ Number inputs — negative? decimal? MAX_SAFE_INTEGER?
□ Date inputs — future dates? past dates?
□ URL inputs — protocol validation?
```

## 7. Error Handling Gaps

```
□ Network error — "Failed to fetch" → user-friendly message?
□ 500 error — stack trace exposed?
□ Timeout — hanging request → UX?
□ JSON parse error — malformed API response?
□ Missing data — API returns null where object expected?
□ CORS error — proper error shown?
```

## 8. Accessibility Bugs

```
□ Keyboard navigation — Tab order logical?
□ Focus trap — Modal-ში focus trapped?
□ Aria labels — interactive elements-ზე?
□ Color contrast — WCAG AA minimum?
□ Screen reader — content logical order?
□ Skip navigation — skip to content link?
```

## 9. Performance Problems

```
□ Bundle size — ახალი dependency → bundle +100KB?
□ Re-renders — React DevTools → unnecessary renders?
□ Memory leak — long session → growing memory?
□ Network waterfall — sequential API calls → parallel?
□ Large lists — 100+ items → virtualization?
□ Image optimization — uncompressed images?
□ useEffect dependency array — missing deps → stale closures?
□ Infinite loops — useEffect → setState → re-render → useEffect
```
