# Root/Saba request: PERF-11b, lazy Firebase on every page (protected file)

**From:** B, round 369 → 370 planning, 2026-11-06 (D-29z1219). **Blocking:** no. PERF-11a runs without it.

## Why this needs you
`perf-plan.md` PERF-11 asks for a "dynamic firebase import". The only static path to Firebase is
`app/contexts/AuthContext.tsx` → `app/lib/auth.ts` (l.4: `import { getIdToken, initFirebase, signInWithGooglePopup } from './firebase.client'`) → `app/lib/firebase.client.ts` → `firebase/app` + `firebase/auth`.
`auth.ts` is in `b-round-318/protected-sha256.txt` and `global_forbidden_files`. The loop does not edit it.

## What it would save (measured / estimated)
- Measured at HEAD `29f4b4d` (production build, CDP encoded Script bytes, `b-round-369/probe/js-head.json`): `/studio-lab` 378,121 B. Firebase and signalr share the `ToastContext-*.js` chunk (57,395 B).
- After PERF-11a (signalr lazy, `b-round-369/probe/js-sketch.json`): 362,465 B. That chunk shrinks to 43,310 B and still holds Firebase.
- **Estimate (inference, not a page measurement):** an esbuild bundle of exactly the symbols `firebase.client.ts` imports is 171,863 B minified and 36,082 B gzip (`/home/runner/b369-fb`, not kept). So lazy Firebase would save about 36 KB on every page, including `/` and `/studio-lab`.
- The perf-plan target "studio-lab JS ≤ 230 KB" cannot be reached in the loop. Even with Firebase lazy, about 326 KB remains. The Studio route chunk alone is 123.9 KB, and framer-motion (39.1 KB) is reached from root through Toast, Header, LeadMagnet and other modules. Moving framer-motion is a separate, store-wide question (PERF-11 later stage or STORE-REDESIGN).

## Proposed diff (one protected file, `app/lib/auth.ts` only)
```diff
-import { getIdToken, initFirebase, signInWithGooglePopup } from './firebase.client';
 ...
 export async function signInWithGoogle(): Promise<User> {
   try {
+    const { getIdToken, initFirebase, signInWithGooglePopup } = await import('./firebase.client');
     await initFirebase();
```
`signInWithGoogle` is the only function in `auth.ts` that uses Firebase (l.214–223). `AuthContext.tsx` and `firebase.client.ts` do not change.

## Risks to weigh
1. **Popup blocker.** `signInWithPopup` needs the click's transient user activation. There is already an `await initFirebase()` before the popup today. A lazy chunk adds a network fetch to that gap. On a slow network the browser may block the popup. Mitigation: start the import when the sign-in modal opens (`AuthModal`, not protected), so the click finds the chunk already loaded.
2. **Tests.** `app/lib/__tests__/download-routes.test.ts` is protected. Any test that mocks `~/lib/firebase.client` with `vi.mock` keeps working with a dynamic import, but this must be re-run.
3. **Real check.** Google sign-in needs Firebase credentials, which the cloud does not have. The browser check of the popup must run on Saba's machine.

## Options
- (a) Root applies the diff above (plus the modal preload) outside the loop and runs the auth tests. Saba checks Google sign-in once by hand.
- (b) Saba grants the loop one narrow edit of `auth.ts` (only the hunk above) as a PERF-11b round. C checks the bytes and the guard in the cloud, and the popup stays a Tech Lead manual row.
- (c) Not now: Firebase stays static. PERF-11 closes with 11a and 11c.

B's recommendation: (a), because the change is 2 lines in a protected file and the only real risk (popup) needs Saba's browser anyway.
