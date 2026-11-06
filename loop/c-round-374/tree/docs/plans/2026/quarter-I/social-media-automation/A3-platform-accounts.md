# A3 - Admin: Platform Accounts Page (OAuth Connect)

## Meta

| Field | Value |
|-------|-------|
| **Layer** | Admin Frontend |
| **Depends On** | 07 (Meta OAuth API) |
| **Blocks** | - |
| **Project** | `admin` |
| **Est. Hours** | 5h |
| **Status** | `pending` |

## აღწერა

Platform accounts management: OAuth connect/disconnect, token status monitoring.

## გვერდი

### Platform Accounts (`/social/accounts`)

- **3 Account Cards** (Facebook Page, Instagram Business, TikTok):
  - Account name + avatar/icon
  - Connection status indicator
  - Token status: Active(green), Expiring Soon(yellow), Expired(red)
  - Days until expiration
  - Last used date
  - "Connect" button (not connected) / "Disconnect" button (connected)
  - "Refresh Token" manual button

- **Connect Flow (Facebook/Instagram)**:
  1. Click "Connect Facebook" → redirect to Meta OAuth
  2. User authorizes → callback saves tokens
  3. Page auto-refreshes showing connected account
  4. IG Business Account auto-discovered from connected FB Page

- **Connect Flow (TikTok)**:
  1. Click "Connect TikTok"
  2. If feature flag disabled → show "TikTok: Pending App Review" message
  3. If enabled → redirect to TikTok OAuth → callback

- **Disconnect**: confirmation dialog → API call → remove from list

- **Token Health Dashboard**:
  - Overview: "2/3 accounts connected"
  - Warning if any token expiring within 7 days

## ფაილები

```
admin/src/pages/social/
├── PlatformAccounts.tsx
└── components/
    ├── PlatformAccountCard.tsx
    ├── TokenStatusIndicator.tsx
    └── ConnectButton.tsx

admin/src/hooks/social/
├── usePlatformAccounts.ts
└── usePlatformAccountMutations.ts
```

## Primitives

წაიკითხე შექმნამდე:
- `admin/.claude/primitives/REACT_QUERY_PATTERNS.md`
- `admin/.claude/primitives/FORWARDREF_COMPONENT.md`

## ვერიფიკაცია

- [ ] 3 platform cards render correctly
- [ ] Connect button initiates OAuth redirect
- [ ] Connected account shows name + status
- [ ] Token status colors: green/yellow/red
- [ ] Disconnect with confirmation works
- [ ] Refresh Token button calls API
- [ ] TikTok disabled state shows correctly when feature flag off
- [ ] `npm run check` passes
