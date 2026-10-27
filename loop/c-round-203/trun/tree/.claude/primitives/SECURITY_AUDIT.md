# SECURITY_AUDIT

## აღწერა

Frontend უსაფრთხოების აუდიტის ჩექლისტი czaba-project store/admin-ისთვის.
გამოიყენე auth flow-ის, API integration-ის ან user input-ის ცვლილებების დროს.

---

## ჩექლისტი

### 1. Token Storage და Auth Flow

- [ ] Access/Refresh token-ები `localStorage`-ში ინახება (არა cookie)
- [ ] Token-ები არ ლოგირდება console-ში
- [ ] Token refresh logic მუშაობს (401 → auto refresh → retry)
- [ ] Logout-ზე ყველა token იშლება localStorage-იდან
- [ ] Auth state არ ენდობა მხოლოდ frontend-ს (backend ამოწმებს)

### 2. XSS პრევენცია

- [ ] `dangerouslySetInnerHTML` არ გამოიყენება
- [ ] User-generated content React-ის ავტომატური escaping-ით რენდერდება
- [ ] URL parameters სანიტიზებულია (`searchParams`)
- [ ] Third-party script-ები (GA4, Facebook Pixel) trusted source-იდან

### 3. CORS და API Communication

- [ ] API URL environment variable-იდან მოდის (`VITE_API_URL`)
- [ ] Credentials header სწორად იგზავნება
- [ ] Error response-ები არ აჩვენებს stack trace-ს მომხმარებელს

### 4. Firebase Social Auth

- [ ] Firebase config მხოლოდ public keys შეიცავს
- [ ] ID token სერვერზე ვალიდირდება (არა კლიენტზე)
- [ ] Firebase SDK მხოლოდ Google Sign-In-ისთვის (არა data storage)

### 5. Sensitive Data Exposure

- [ ] API keys არ არის კოდში (გარდა Firebase public config)
- [ ] `.env` ფაილი `.gitignore`-ში არის
- [ ] Network tab-ში sensitive data არ ჩანს (passwords, full tokens)
- [ ] Error boundary-ები არ აჩვენებს internal details-ს

### 6. Content Security Policy

- [ ] CSP header კონფიგურირებულია (script-src, style-src)
- [ ] Inline scripts მინიმალურია
- [ ] External resource-ები whitelist-ში

### 7. Input Validation (Client-Side)

- [ ] Form validation არის (email format, password strength)
- [ ] File upload type/size შემოწმებულია კლიენტზე
- [ ] Client-side validation არ ანაცვლებს server-side validation-ს

### 8. Stripe Integration (Store)

- [ ] Stripe.js ოფიციალური CDN-იდან იტვირთება
- [ ] Card details არ გადის ჩვენს სერვერზე (Stripe Checkout redirect)
- [ ] Payment confirmation backend-იდან მოწმდება

---

## ❌ vs ✅ ნიმუშები

### Token Handling

```typescript
// ❌ Token console-ში
console.log("Token:", accessToken);

// ✅ Token მხოლოდ API header-ში
apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
```

### XSS

```tsx
// ❌ Raw HTML rendering
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ React auto-escaping
<div>{userComment}</div>
```

### Error Display

```tsx
// ❌ Internal error exposed
<div>{error.stack}</div>

// ✅ User-friendly message
<div>{getErrorMessage(error.code)}</div>
```

### Environment Variables

```typescript
// ❌ Hardcoded API URL
const API_URL = "http://localhost:5199";

// ✅ Environment variable
const API_URL = import.meta.env.VITE_API_URL;
```

---

## აუდიტის პროცესი

1. Auth flow ცვლილებაზე გაუშვი ეს ჩექლისტი
2. ახალი third-party integration-ზე შეამოწმე CSP და XSS
3. ❌ პუნქტები გახდება დავალება
4. Critical (token leak, XSS) - დაუყოვნებლივ გამოსწორება
