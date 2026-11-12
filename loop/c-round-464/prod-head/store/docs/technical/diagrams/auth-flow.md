# Auth Flow - CZABA Store

## აღწერა

CZABA Store-ის ავტორიზაციის სისტემა მოიცავს სამ ძირითად flow-ს:
- **Email/Password** - რეგისტრაცია და შესვლა Czaba Backend API-ის მეშვეობით
- **Google OAuth** - Firebase popup-ით ID Token-ის მიღება და Backend-ზე გადაგზავნა
- **Token Refresh** - ავტომატური ტოკენის განახლება 401 შეცდომისას

ტოკენები ინახება `localStorage.auth_user`-ში და სინქრონიზდება ტაბებს შორის `StorageEvent`-ით.

---

## 1. აპლიკაციის ინიციალიზაცია

აპლიკაციის ჩატვირთვისას `AuthProvider` ამოწმებს შენახულ სესიას.

```mermaid
sequenceDiagram
    participant App as AuthProvider
    participant LS as localStorage
    participant API as ApiClient
    participant BE as Czaba Backend

    App->>API: setTokenRefreshCallback()
    App->>API: setSessionExpiredCallback()
    App->>LS: getItem("auth_user")

    alt მომხმარებელი შენახულია
        LS-->>App: parsedUser (JSON)
        App->>API: setAccessToken(parsedUser.accessToken)
        App->>BE: GET /api/auth/profile
        alt ტოკენი ვალიდურია
            BE-->>App: UserProfile
            App->>App: setUser(customer)
        else ტოკენი ვადაგასულია
            BE-->>App: 401 Unauthorized
            Note over API,BE: იწყება Token Refresh Flow
            App->>LS: removeItem("auth_user")
            App->>API: setAccessToken(undefined)
        end
    else მომხმარებელი არ არის შენახული
        LS-->>App: null
        App->>App: setIsInitializing(false)
    end
```

---

## 2. Email/Password - შესვლა

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant AC as AuthContext
    participant Auth as auth.ts
    participant API as ApiClient
    participant BE as Czaba Backend
    participant LS as localStorage

    U->>AC: signIn(email, password)
    AC->>AC: setIsLoading(true)
    AC->>Auth: signIn(email, password)

    Auth->>Auth: validateEmail(email)
    alt ვალიდაცია ჩავარდა
        Auth-->>AC: throw Error (EMAIL_REQUIRED / INVALID_EMAIL / PASSWORD_REQUIRED)
        AC-->>U: შეცდომის ჩვენება
    end

    Auth->>API: login({ email, password })
    API->>BE: POST /api/auth/login

    alt წარმატებული
        BE-->>API: AuthResponse (accessToken, refreshToken, userId, email...)
        API-->>Auth: AuthResponse
        Auth->>Auth: authResponseToUser(response, "email")
        Auth->>API: setAccessToken(accessToken)
        Auth-->>AC: User
        AC->>AC: setUser(userData)
        AC->>LS: setItem("auth_user", JSON.stringify(userData))
        AC->>AC: closeModal()
        AC-->>U: ავტორიზებული
    else არასწორი მონაცემები (401)
        BE-->>API: 401 / "invalid"
        API-->>Auth: Error
        Auth-->>AC: throw Error (INVALID_CREDENTIALS)
        AC-->>U: "Incorrect email or password"
    else ქსელის შეცდომა
        API-->>Auth: Network Error
        Auth-->>AC: throw Error (NETWORK_ERROR)
        AC-->>U: "Connection failed. Please try again."
    end
```

---

## 3. Email/Password - რეგისტრაცია

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant AC as AuthContext
    participant Auth as auth.ts
    participant API as ApiClient
    participant BE as Czaba Backend
    participant LS as localStorage

    U->>AC: signUp(name, email, password)
    AC->>AC: setIsLoading(true)
    AC->>Auth: signUp(name, email, password)

    Auth->>Auth: ვალიდაცია (name, email, password >= 8)
    alt ვალიდაცია ჩავარდა
        Auth-->>AC: throw Error
        AC-->>U: შეცდომის ჩვენება
    end

    Auth->>Auth: name.split(" ") → firstName, lastName
    Auth->>API: register({ email, password, firstName, lastName })
    API->>BE: POST /api/auth/register

    alt წარმატებული
        BE-->>API: AuthResponse
        API-->>Auth: AuthResponse
        Auth->>Auth: authResponseToUser(response, "email")
        Auth->>API: setAccessToken(accessToken)
        Auth-->>AC: User
        AC->>AC: setUser(userData)
        AC->>LS: setItem("auth_user", JSON.stringify(userData))
        AC->>AC: closeModal()
        AC-->>U: რეგისტრირებული და ავტორიზებული
    else ელფოსტა უკვე არსებობს
        BE-->>API: Error ("exists" / "already")
        API-->>Auth: Error
        Auth-->>AC: throw Error (EMAIL_EXISTS)
        AC-->>U: "This email is already registered"
    else ქსელის შეცდომა
        API-->>Auth: Network Error
        Auth-->>AC: throw Error (NETWORK_ERROR)
        AC-->>U: "Connection failed. Please try again."
    end
```

---

## 4. Google OAuth

Firebase popup-ით Google ავტორიზაცია და Backend-ზე ვერიფიკაცია.

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant AC as AuthContext
    participant Auth as auth.ts
    participant FB as Firebase Auth
    participant G as Google OAuth
    participant API as ApiClient
    participant BE as Czaba Backend
    participant LS as localStorage

    U->>AC: signInWithGoogle()
    AC->>AC: setIsLoading(true)
    AC->>Auth: signInWithGoogle()

    Auth->>FB: initFirebase()
    Note over FB: Singleton - ინიციალიზაცია ერთხელ

    Auth->>FB: signInWithGooglePopup()
    FB->>G: signInWithPopup(auth, GoogleAuthProvider)
    Note over G: prompt: "select_account"

    alt მომხმარებელმა აირჩია ანგარიში
        G-->>FB: UserCredential
        FB-->>Auth: UserCredential (result)

        Auth->>FB: getIdToken(result.user)
        FB-->>Auth: Firebase ID Token (JWT)

        Auth->>API: socialLogin({ idToken })
        API->>BE: POST /api/auth/social { idToken }

        Note over BE: Backend ამოწმებს Firebase ID Token-ს<br/>ქმნის/პოულობს მომხმარებელს<br/>გასცემს JWT ტოკენებს

        alt წარმატებული
            BE-->>API: AuthResponse
            API-->>Auth: AuthResponse
            Auth->>Auth: authResponseToUser(response, "google")
            Auth->>API: setAccessToken(accessToken)
            Auth-->>AC: User
            AC->>AC: setUser(userData)
            AC->>LS: setItem("auth_user", JSON.stringify(userData))
            AC->>AC: closeModal()
            AC-->>U: ავტორიზებული (Google)
        else Backend შეცდომა
            BE-->>API: Error
            API-->>Auth: Error
            Auth-->>AC: throw Error
            AC-->>U: შეცდომის ჩვენება
        end

    else მომხმარებელმა დახურა popup
        G-->>FB: Error (popup closed)
        FB-->>Auth: Error
        Auth-->>AC: throw Error
        AC-->>U: შეცდომის ჩვენება
    end
```

---

## 5. Token Refresh (ავტომატური)

API Client ავტომატურად ანახლებს ტოკენს 401 პასუხისას.

```mermaid
sequenceDiagram
    participant C as კომპონენტი
    participant API as ApiClient
    participant BE as Czaba Backend
    participant LS as localStorage
    participant AC as AuthContext

    C->>API: request(endpoint)
    API->>BE: GET /api/... (Authorization: Bearer accessToken)
    BE-->>API: 401 Unauthorized

    API->>LS: getItem("auth_user") → refreshToken

    alt refreshToken არსებობს
        Note over API: Singleton Pattern -<br/>მხოლოდ ერთი refresh მოთხოვნა ერთდროულად

        API->>BE: POST /api/auth/refresh { refreshToken }

        alt Refresh წარმატებული
            BE-->>API: AuthResponse (ახალი accessToken, refreshToken)
            API->>API: accessToken = newAccessToken
            API->>AC: onTokenRefreshed(AuthResponse)
            AC->>AC: setUser({ ...prev, accessToken, refreshToken })
            AC->>LS: setItem("auth_user", updatedUser)

            Note over API: თავიდან მოთხოვნის გაგზავნა ახალი ტოკენით

            API->>BE: GET /api/... (Authorization: Bearer newAccessToken)
            BE-->>API: 200 OK (data)
            API-->>C: data
        else Refresh ჩავარდა
            BE-->>API: Error
            API->>AC: onSessionExpired()
            AC->>AC: setUser(null)
            AC->>LS: removeItem("auth_user")
            AC->>API: setAccessToken(undefined)
            AC->>AC: openModal("signin")
            API-->>C: throw Error ("Session expired")
        end

    else refreshToken არ არსებობს
        API->>AC: onSessionExpired()
        AC->>AC: setUser(null)
        AC->>LS: removeItem("auth_user")
        AC->>AC: openModal("signin")
        API-->>C: throw Error ("Please sign in")
    end
```

---

## 6. პაროლის აღდგენა

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant AC as AuthContext
    participant Auth as auth.ts
    participant API as ApiClient
    participant BE as Czaba Backend

    U->>AC: resetPassword(email)
    AC->>AC: setIsLoading(true)
    AC->>Auth: resetPassword(email)

    Auth->>Auth: validateEmail(email)
    alt ვალიდაცია ჩავარდა
        Auth-->>AC: throw Error
        AC-->>U: შეცდომის ჩვენება
    end

    Auth->>API: forgotPassword(email)
    API->>BE: POST /api/auth/forgot-password { email }

    Note over BE: უსაფრთხოების მიზნით<br/>ყოველთვის აბრუნებს წარმატებას

    BE-->>API: 200 OK
    API-->>Auth: void
    Auth-->>AC: void
    AC-->>U: "შეამოწმეთ ელფოსტა"

    Note over U: მომხმარებელი იღებს email-ს reset ლინკით

    U->>Auth: customerResetPassword(token, newPassword)
    Auth->>Auth: validatePassword(newPassword >= 8)
    Auth->>API: resetPassword(token, newPassword)
    API->>BE: POST /api/auth/reset-password { token, newPassword }

    alt წარმატებული
        BE-->>API: 200 OK
        API-->>Auth: void
        Auth-->>U: პაროლი შეიცვალა
    else არავალიდური/ვადაგასული ტოკენი
        BE-->>API: Error ("invalid" / "expired")
        Auth-->>U: "This password reset link is invalid or has expired"
    end
```

---

## 7. გასვლა (Sign Out)

```mermaid
sequenceDiagram
    participant U as მომხმარებელი
    participant AC as AuthContext
    participant Auth as auth.ts
    participant API as ApiClient
    participant LS as localStorage

    U->>AC: signOut()
    AC->>Auth: signOut(user.accessToken)
    Auth->>API: setAccessToken(undefined)
    Note over Auth: Refresh token ვადა ბუნებრივად ამოიწურება
    Auth-->>AC: void
    AC->>AC: setUser(null)
    AC->>LS: removeItem("auth_user")
    AC->>API: setAccessToken(undefined)
    AC-->>U: გამოსული
```

---

## 8. მრავალ-ტაბის სინქრონიზაცია

```mermaid
sequenceDiagram
    participant T1 as ტაბი 1
    participant LS as localStorage
    participant T2 as ტაბი 2

    Note over T1: მომხმარებელი გავიდა ტაბ 1-ში
    T1->>LS: removeItem("auth_user")
    LS-->>T2: StorageEvent (key="auth_user", newValue=null)
    T2->>T2: setUser(null)
    T2->>T2: apiClient.setAccessToken(undefined)

    Note over T1: ტოკენი განახლდა ტაბ 1-ში
    T1->>LS: setItem("auth_user", updatedUser)
    LS-->>T2: StorageEvent (key="auth_user", newValue=JSON)
    T2->>T2: setUser(JSON.parse(newValue))
    T2->>T2: apiClient.setAccessToken(updated.accessToken)
```

---

## არქიტექტურის მიმოხილვა

```mermaid
flowchart TB
    subgraph Frontend ["Frontend (Remix)"]
        UI[UI კომპონენტები]
        AC[AuthContext]
        AUTH[auth.ts]
        APIC[ApiClient]
        FB[firebase.client.ts]
        LS[(localStorage<br/>auth_user)]
    end

    subgraph External ["გარე სერვისები"]
        GOOGLE[Google OAuth]
        FIREBASE[Firebase Auth<br/>czaba-api]
    end

    subgraph Backend ["Czaba Backend (.NET)"]
        LOGIN[POST /api/auth/login]
        REG[POST /api/auth/register]
        SOCIAL[POST /api/auth/social]
        REFRESH[POST /api/auth/refresh]
        PROFILE[GET /api/auth/profile]
        FORGOT[POST /api/auth/forgot-password]
        RESET[POST /api/auth/reset-password]
    end

    UI -->|signIn / signUp / signInWithGoogle| AC
    AC -->|delegireba| AUTH
    AUTH -->|Email/Password| APIC
    AUTH -->|Google OAuth| FB
    FB -->|popup| FIREBASE
    FIREBASE -->|redirect| GOOGLE
    GOOGLE -->|UserCredential| FIREBASE
    FIREBASE -->|ID Token| AUTH
    AUTH -->|socialLogin| APIC

    APIC -->|login| LOGIN
    APIC -->|register| REG
    APIC -->|socialLogin| SOCIAL
    APIC -->|refreshToken| REFRESH
    APIC -->|getProfile| PROFILE
    APIC -->|forgotPassword| FORGOT
    APIC -->|resetPassword| RESET

    AC <-->|read/write| LS
    APIC -->|401 → auto refresh| REFRESH

    style Frontend fill:#1a1a2e,stroke:#e94560,color:#eee
    style Backend fill:#0f3460,stroke:#16213e,color:#eee
    style External fill:#533483,stroke:#2b2d42,color:#eee
```

---

## ფაილების მაპინგი

| ფაილი | როლი |
|-------|------|
| `app/contexts/AuthContext.tsx` | State management, localStorage, მრავალ-ტაბი სინქრონიზაცია |
| `app/lib/auth.ts` | ვალიდაცია, auth ფუნქციები, User ობიექტის ფორმირება |
| `app/lib/firebase.client.ts` | Firebase ინიციალიზაცია, Google/Facebook popup |
| `app/services/api/client.ts` | HTTP მოთხოვნები, ავტომატური token refresh, 401 handling |
| `app/types/auth.ts` | TypeScript ტიპები (User, AuthContextValue, AUTH_ERRORS) |
