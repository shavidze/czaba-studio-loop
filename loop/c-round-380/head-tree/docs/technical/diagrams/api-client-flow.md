# API Client Flow

## აღწერა

CZABA Store-ის API Client (`app/services/api/client.ts`) HTTP მოთხოვნების სრული ციკლი: request მომზადება, Authorization header-ის დამატება, 401 Unauthorized-ის დამუშავება, token refresh singleton pattern, retry logic და session expiration flow.

API Client არის singleton ინსტანცია (`ApiClient` კლასი), რომელიც მართავს ყველა HTTP კომუნიკაციას Czaba .NET Backend-თან (`localhost:5199`).

---

## 1. HTTP Request Lifecycle

მოთხოვნის სრული ციკლი - მომზადებიდან პასუხის დაბრუნებამდე.

```mermaid
flowchart TD
    A["apiClient.method()<br/>(getProducts, login, getCart...)"] --> B["request&lt;T&gt;(endpoint, options, skipAuthRefresh)"]

    B --> C["Headers მომზადება<br/>Content-Type: application/json"]
    C --> D{accessToken<br/>არსებობს?}
    D -- კი --> E["Authorization: Bearer {token}<br/>დამატება"]
    D -- არა --> F["Header-ები token-ის გარეშე"]

    E --> G["fetch(baseUrl + endpoint, options)"]
    F --> G

    G --> H{response.status}

    H -- "401 &&<br/>!skipAuthRefresh" --> I["401 Handler<br/>(Token Refresh Flow)"]
    H -- "!response.ok<br/>(4xx/5xx)" --> J["Error Extraction"]
    H -- "200 OK" --> K["response.json()<br/>ApiResponse&lt;T&gt; parsing"]

    J --> J1["response.json().catch(() => {})"]
    J1 --> J2["error.detail || error.message ||<br/>getHttpErrorMessage(status)"]
    J2 --> J3["throw new Error(errorMessage)"]

    K --> L{result.success?}
    L -- კი --> M["return result.data"]
    L -- არა --> N["throw new Error(<br/>result.message || 'API request failed')"]

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style I fill:#e94560,stroke:#fff,color:#fff
    style M fill:#0f3460,stroke:#16c79a,color:#fff
    style J3 fill:#e94560,stroke:#fff,color:#fff
    style N fill:#e94560,stroke:#fff,color:#fff
```

---

## 2. Token Refresh Singleton Pattern

401 მიღებისას მხოლოდ ერთი refresh მოთხოვნა იგზავნება. პარალელური მოთხოვნები იმავე Promise-ს იყენებენ.

```mermaid
flowchart TD
    A["401 Unauthorized მიღებულია"] --> B{skipAuthRefresh?}
    B -- კი --> B1["throw Error<br/>(retry-ც ვერ მოხერხდა)"]
    B -- არა --> C["getStoredRefreshToken()"]

    C --> D{refreshToken<br/>არსებობს?}

    D -- არა --> E["onSessionExpired()<br/>callback გამოძახება"]
    E --> E1["throw new Error(<br/>'Please sign in to continue.')"]

    D -- კი --> F{refreshPromise<br/>!== null?}

    F -- "კი<br/>(სხვა request უკვე<br/>აკეთებს refresh-ს)" --> G["await this.refreshPromise<br/>(მიერთება არსებულ Promise-ზე)"]

    F -- "არა<br/>(პირველი 401)" --> H["this.refreshPromise =<br/>refreshTokenInternal(refreshToken)"]
    H --> G

    G --> I{refresh<br/>წარმატებული?}

    I -- კი --> J["this.refreshPromise = null"]
    J --> K["this.accessToken = newToken"]
    K --> L["onTokenRefreshed(authResponse)<br/>callback გამოძახება"]
    L --> M["Retry: fetch(endpoint)<br/>ახალი token-ით"]

    M --> M1{retry<br/>წარმატებული?}
    M1 -- კი --> M2["return retryResult.data"]
    M1 -- არა --> M3["throw new Error(errorMessage)"]

    I -- არა --> N["this.refreshPromise = null"]
    N --> O["onSessionExpired()<br/>callback გამოძახება"]
    O --> P["throw new Error(<br/>'Session expired. Please sign in again.')"]

    style A fill:#e94560,stroke:#fff,color:#fff
    style M2 fill:#0f3460,stroke:#16c79a,color:#fff
    style E1 fill:#e94560,stroke:#fff,color:#fff
    style P fill:#e94560,stroke:#fff,color:#fff
    style M3 fill:#e94560,stroke:#fff,color:#fff
    style G fill:#533483,stroke:#e94560,color:#fff
```

---

## 3. Concurrent Requests During Token Refresh

რამდენიმე პარალელური მოთხოვნა 401-ის მიღებისას - Singleton Promise pattern.

```mermaid
sequenceDiagram
    participant R1 as Request A
    participant R2 as Request B
    participant R3 as Request C
    participant AC as ApiClient
    participant BE as Backend API
    participant AUTH as /api/auth/refresh

    R1->>BE: GET /api/products
    R2->>BE: GET /api/cart
    R3->>BE: GET /api/orders/my

    BE-->>R1: 401 Unauthorized
    BE-->>R2: 401 Unauthorized
    BE-->>R3: 401 Unauthorized

    R1->>AC: refreshPromise === null?
    Note over AC: refreshPromise = null (პირველი)
    AC->>AUTH: POST /api/auth/refresh
    Note over AC: refreshPromise = Promise<AuthResponse>

    R2->>AC: refreshPromise === null?
    Note over AC: refreshPromise !== null (უკვე არსებობს)
    R2->>AC: await refreshPromise

    R3->>AC: refreshPromise === null?
    Note over AC: refreshPromise !== null (უკვე არსებობს)
    R3->>AC: await refreshPromise

    AUTH-->>AC: 200 OK {accessToken, refreshToken}
    Note over AC: refreshPromise = null

    AC-->>R1: ახალი token
    AC-->>R2: ახალი token
    AC-->>R3: ახალი token

    R1->>BE: GET /api/products (ახალი token)
    R2->>BE: GET /api/cart (ახალი token)
    R3->>BE: GET /api/orders/my (ახალი token)

    BE-->>R1: 200 OK
    BE-->>R2: 200 OK
    BE-->>R3: 200 OK
```

---

## 4. Error Classification

HTTP status კოდების კლასიფიკაცია და შესაბამისი User-facing შეტყობინებები.

```mermaid
flowchart TD
    A["HTTP Response"] --> B{status code}

    B -- "401" --> C["Token Refresh Flow<br/>(ავტომატური)"]
    C --> C1{refresh<br/>წარმატებული?}
    C1 -- კი --> C2["Retry + Return"]
    C1 -- არა --> C3["Session Expired<br/>→ Login Modal"]

    B -- "400" --> D["'Invalid request.<br/>Please check your input and try again.'"]
    B -- "403" --> E["'You do not have permission<br/>to perform this action.'"]
    B -- "404" --> F["'The requested item<br/>was not found.'"]
    B -- "408" --> G["'Request timed out.<br/>Please try again.'"]
    B -- "409" --> H["'This action conflicts<br/>with existing data.'"]
    B -- "422" --> I["'Unable to process your request.<br/>Please check your input.'"]
    B -- "429" --> J["'Too many requests.<br/>Please wait a moment and try again.'"]

    B -- "500" --> K["'Something went wrong on our end.<br/>Please try again later.'"]
    B -- "502" --> L["'Service temporarily unavailable.<br/>Please try again later.'"]
    B -- "503" --> M["'Service is currently unavailable.<br/>Please try again later.'"]
    B -- "504" --> N["'Request timed out.<br/>Please try again later.'"]

    B -- "სხვა" --> O["'An unexpected error occurred<br/>(code: {status}).'"]

    D & E & F & G & H & I & J & K & L & M & N & O --> P["throw new Error(message)"]

    style C fill:#533483,stroke:#e94560,color:#fff
    style C2 fill:#0f3460,stroke:#16c79a,color:#fff
    style C3 fill:#e94560,stroke:#fff,color:#fff
    style P fill:#e94560,stroke:#fff,color:#fff
```

---

## 5. Session Expiration Flow

Token refresh წარუმატებლობისას - სრული logout ციკლი.

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant AC as ApiClient
    participant AUTH as AuthContext
    participant LS as localStorage
    participant Modal as Auth Modal

    UI->>AC: request() (ნებისმიერი API call)
    AC->>AC: fetch() → 401 Unauthorized

    AC->>LS: getItem('auth_user')
    LS-->>AC: {refreshToken: "..."}

    AC->>AC: POST /api/auth/refresh
    AC-->>AC: Refresh Failed (401/500)

    Note over AC: refreshPromise = null

    AC->>AUTH: onSessionExpired() callback

    AUTH->>AUTH: setUser(null)
    AUTH->>LS: removeItem('auth_user')
    AUTH->>AC: setAccessToken(undefined)
    AUTH->>AUTH: setModalView('signin')
    AUTH->>Modal: setIsModalOpen(true)

    Note over Modal: Sign In მოდალი გაიხსნა

    AC-->>UI: throw Error('Session expired.<br/>Please sign in again.')
```

---

## 6. ApiResponse Wrapper

Backend API-ს პასუხის სტანდარტული ფორმატი და მისი დამუშავება.

```mermaid
flowchart LR
    subgraph "Backend Response Format"
        A["ApiResponse&lt;T&gt;"]
        A1["data: T"]
        A2["success: boolean"]
        A3["message?: string"]
        A4["errors?: string[]"]
        A --> A1 & A2 & A3 & A4
    end

    subgraph "Client Processing"
        B{success === true?}
        B -- კი --> C["return data"]
        B -- არა --> D["throw Error(message)"]
    end

    subgraph "Error Response Format"
        E["HTTP Error Body"]
        E1["detail?: string"]
        E2["message?: string"]
        E --> E1 & E2
    end

    subgraph "Error Priority"
        F["1. error.detail"]
        G["2. error.message"]
        H["3. getHttpErrorMessage(status)"]
        F --> G --> H
    end

    A2 --> B

    style C fill:#0f3460,stroke:#16c79a,color:#fff
    style D fill:#e94560,stroke:#fff,color:#fff
```

---

## 7. AuthContext - ApiClient ინტეგრაცია

ApiClient-ის callback-ების რეგისტრაცია და token management.

```mermaid
flowchart TD
    subgraph "აპლიკაციის ინიციალიზაცია"
        A["AuthProvider mount"] --> B["apiClient.setTokenRefreshCallback()"]
        A --> C["apiClient.setSessionExpiredCallback()"]
        A --> D["localStorage.getItem('auth_user')"]
        D --> E{stored user<br/>არსებობს?}
        E -- კი --> F["apiClient.setAccessToken(token)"]
        F --> G["apiClient.getProfile()<br/>(token ვალიდაციისთვის)"]
        G --> G1{პროფილი<br/>ჩაიტვირთა?}
        G1 -- კი --> G2["setUser(customer)"]
        G1 -- არა --> G3["localStorage.removeItem()<br/>apiClient.setAccessToken(undefined)"]
        E -- არა --> H["setIsInitializing(false)"]
    end

    subgraph "Token Refresh Callback"
        I["onTokenRefreshed(response)"] --> J["setUser: update tokens"]
        J --> K["localStorage.setItem('auth_user')"]
    end

    subgraph "Session Expired Callback"
        L["onSessionExpired()"] --> M["setUser(null)"]
        M --> N["localStorage.removeItem('auth_user')"]
        N --> O["apiClient.setAccessToken(undefined)"]
        O --> P["Auth Modal: Sign In"]
    end

    subgraph "Multi-Tab Sync"
        Q["storage event listener"] --> R{key === 'auth_user'?}
        R -- "newValue === null" --> S["setUser(null)<br/>(სხვა tab-ში გავიდა)"]
        R -- "newValue !== null" --> T["setUser(parsed)<br/>apiClient.setAccessToken()<br/>(სხვა tab-ში token განახლდა)"]
    end

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style G2 fill:#0f3460,stroke:#16c79a,color:#fff
    style G3 fill:#e94560,stroke:#fff,color:#fff
    style P fill:#e94560,stroke:#fff,color:#fff
```

---

## 8. სრული Request → Refresh → Retry Flowchart

ერთიანი სქემა - მოთხოვნის სრული ციკლი ყველა შესაძლო სცენარით.

```mermaid
flowchart TD
    START(["API მოთხოვნა"]) --> PREP["Headers მომზადება<br/>Content-Type + Authorization"]
    PREP --> FETCH["fetch(baseUrl + endpoint)"]
    FETCH --> STATUS{HTTP Status?}

    STATUS -- "200" --> PARSE["ApiResponse&lt;T&gt; parsing"]
    PARSE --> SUCCESS{success?}
    SUCCESS -- კი --> RETURN(["return data"])
    SUCCESS -- არა --> THROW_API(["throw Error(message)"])

    STATUS -- "401<br/>skipAuthRefresh=false" --> HAS_RT{refreshToken<br/>localStorage-ში?}

    HAS_RT -- არა --> EXPIRED_NO_RT(["onSessionExpired()<br/>throw Error"])

    HAS_RT -- კი --> PROMISE{refreshPromise<br/>arსებობს?}
    PROMISE -- არა --> CREATE["refreshPromise =<br/>POST /api/auth/refresh"]
    PROMISE -- კი --> AWAIT["await refreshPromise<br/>(სხვა request-მა შექმნა)"]
    CREATE --> AWAIT

    AWAIT --> REFRESH_OK{refresh<br/>წარმატებული?}

    REFRESH_OK -- კი --> UPDATE["accessToken განახლება<br/>onTokenRefreshed callback<br/>refreshPromise = null"]
    UPDATE --> RETRY["Retry: fetch(endpoint)<br/>ახალი token-ით"]
    RETRY --> RETRY_STATUS{retry<br/>status?}

    RETRY_STATUS -- "200" --> RETRY_PARSE["ApiResponse parsing"]
    RETRY_PARSE --> RETRY_SUCCESS{success?}
    RETRY_SUCCESS -- კი --> RETURN
    RETRY_SUCCESS -- არა --> THROW_API

    RETRY_STATUS -- "!ok" --> THROW_RETRY(["throw Error<br/>(retry-ც ვერ მოხერხდა)"])

    REFRESH_OK -- არა --> EXPIRED_FAIL["refreshPromise = null"]
    EXPIRED_FAIL --> EXPIRED(["onSessionExpired()<br/>throw Error<br/>'Session expired'"])

    STATUS -- "400-499<br/>(არა 401)" --> ERR_EXTRACT["Error Extraction:<br/>detail → message → httpMessage"]
    ERR_EXTRACT --> THROW_HTTP(["throw Error(message)"])

    STATUS -- "500-599" --> ERR_SERVER["Server Error Message"]
    ERR_SERVER --> THROW_HTTP

    style START fill:#1a1a2e,stroke:#e94560,color:#fff
    style RETURN fill:#0f3460,stroke:#16c79a,color:#fff
    style THROW_API fill:#e94560,stroke:#fff,color:#fff
    style THROW_HTTP fill:#e94560,stroke:#fff,color:#fff
    style THROW_RETRY fill:#e94560,stroke:#fff,color:#fff
    style EXPIRED fill:#e94560,stroke:#fff,color:#fff
    style EXPIRED_NO_RT fill:#e94560,stroke:#fff,color:#fff
    style AWAIT fill:#533483,stroke:#e94560,color:#fff
```

---

## ძირითადი ფაილები

| ფაილი | როლი |
|-------|------|
| `app/services/api/client.ts` | ApiClient კლასი - HTTP layer, token refresh, retry |
| `app/contexts/AuthContext.tsx` | Token management, callback-ების რეგისტრაცია |
| `app/lib/auth.ts` | Auth ფუნქციები (signIn, signUp, signInWithGoogle) |
| `app/types/auth.ts` | User, AuthContextValue, AUTH_ERRORS ტიპები |
| `app/lib/firebase.client.ts` | Firebase Google Sign-In (მხოლოდ ID token-ისთვის) |

## Token Storage

```
localStorage['auth_user'] = {
  id, email, firstName, lastName, name,
  accessToken,      // JWT - API მოთხოვნებისთვის
  refreshToken,     // Refresh token - accessToken-ის განახლებისთვის
  accessTokenExpires // Token-ის ვადა
}
```

## ძირითადი პრინციპები

- **Singleton Refresh**: ერთდროულად მხოლოდ ერთი refresh მოთხოვნა (`refreshPromise` pattern)
- **ავტომატური Retry**: 401-ის შემდეგ token refresh და ორიგინალი მოთხოვნის ხელახლა გაგზავნა
- **skipAuthRefresh flag**: retry მოთხოვნა იგზავნება `skipAuthRefresh=true`-ით, რათა თავიდან აირიდოს უსასრულო ციკლი
- **Callback Pattern**: `onTokenRefreshed` და `onSessionExpired` callback-ები AuthContext-თან ინტეგრაციისთვის
- **Multi-Tab Sync**: `storage` event listener სხვა tab-ებთან სინქრონიზაციისთვის
