# Round 505: DPG-BUTTON-CLEANUP-2 stage 2d. Move the `/support` chat actions ("Start Chat", "Send message") onto `Button` / `IconButton`, and keep keyboard focus in the chat

**Planned by:** B, at the round 504 → 505 planning on 2026-11-14 (`b-round-504.md`).
- **Advisor:** available; consulted after orientation and at the closing check.
- **Archive:** the round-504 task is archived as `tasks/round-504.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v506, `decisions_log_b`)
- **D-29z1817: round 504 is accepted, from C's evidence only.**
  - `c-round-504.json` is PASS, with `browserVerified` and `realVerified` true and 0 bugs. `c-round-504/l57-check.txt` says `L57 OK`. Gate 504 is `published` at `e3e9e49` [K21, K22].
  - Stage 2c is verified. The stubbed owner/upgrade rows' real-backend half is kept as PURCHASE-REAL-BACKEND (`open_backend`).
- **D-29z1818: round-504 follow-ups (L7).**
  - A-R504-CR-1 and CR-2 go to `deferred_low_polish`.
  - CR-3 is `confirmedBy` on A-R503-CR-3-STUBCATALOG-DRIFT. CR-4 and gate Low 1 are `confirmedBy` on PD-R504-DISABLED-NO-REASON.
  - Gate Low 2 and the Architecture note are `confirmedBy` on SIG-R501-SHARED-BUTTON-SCANNER (decided at the stage-2 close).
  - Gate Low 3 (doc 325 "In Progress") is the multi-stage L28 contract, with no id.
- **D-29z1819: stage 2d scope and liveness.**
  - Inventory row A4 (`b-round-497/stage2-inventory.md`) names GuestForm, ChatInput and ChatButton.
  - **Live:** `GuestForm` and `ChatInput` are live only through `/support` → "Live Chat" → `ChatWindow` [K3].
  - **Dead:** `ChatButton` is reached only through `ChatWidget`, which nothing imports [K4]. It is **not** migrated: it cannot be browser-verified, and three token tests pin or allow-list it. It stays under LEGACY-DEAD-STORE-COMPONENTS, so A4 is not fully closed.
  - **Untouched:** `support.tsx`'s two hand-rolled buttons [K5] (the "Live Chat" card and "Back to support options") are NONBRAND; `ChatHeader`'s icon buttons are out of this stage.
- **D-29z1820: mapping (product-designer, `b-round-504/consult-product-designer.md`).**
  - "Start Chat" → `<Button type="submit" size="lg" fullWidth>`, default shape (8 px). md (40 px, 14 px text) and pill were rejected.
  - "Send message" → `<IconButton type="submit" variant="brand" size="md" label="Send message">`, with a 20 px icon. IconButton is the system's icon-only component (DESIGN_SYSTEM l.883 [K36]). A `Button` with an icon child (48×36) and leaving it hand-rolled were rejected.
  - The **IconButton `brand` variant** loses the retired `hover:shadow-glow` and its own `active:scale-95` (the global 0.98 press stays). The glow and undefined-token tests drop IconButton from their dead allow-lists.
  - **Focus (WCAG 2.4.3, owned code, cheap; in scope):**
    - after a button send, focus returns to the message textarea;
    - when the chat window that opened with the guest form switches to the chat, the textarea is focused;
    - a window that opens straight into a session (signed in) does not move focus.
  - **Deferred** (not this round): `noValidate` + `aria-invalid`/`aria-describedby` as one form-accessibility change (B-R505-GUESTFORM-NATIVE-VALIDATION; no `noValidate` at HEAD [K12, K33]); the textarea's accessible name (B-R505-CHAT-TEXTAREA-NO-LABEL); focus after "Live Chat" opens (B-R505-LIVECHAT-OPEN-FOCUS).
- **D-29z1821: consults and review.** See `b-round-504/sketch-review.md`.
  - tech-lead v1 (`841657ad…`): **APPROVE WITH CONDITIONS**. Its two Mediums are product-designer's draft C rows (Send "8px", file-wide scale-95), superseded by this task's C1 and C8 (ruling line below). Lows 4–5 (B2D-8 exact source line, B2D-5 title) are fixed in v2. Low 3 is deferred as TL-R505-FOCUS-FLAG-AUTH-CHANGE; the 0.931 compounded press on IconButton default/ghost is TL-R505-ICONBUTTON-SCALE-COMPOUND (info).
  - The v2 delta review (`f2e389b9…`) is **APPROVE**.
  - **D-29z1822 (closing check):** v3 (`5c0ed195…`, the dispatched sha) adds the L47 async-settle guard (mount focus only from BODY), B2D-9 and mutants M13–M15. It also fixes the probe's hover leak on the ready Send rest read and adds the in-flight and "Live Chat" focus rows. tech-lead review 3 said REQUEST CHANGES, reasoning from the dead `ChatWidget`. B's answer, with `probe/m15-browser.out` (in-flight row red without the guard), was accepted in review 4: **APPROVE**.
  - **No architecture checkpoint:** one owner (chat), a component swap plus a focus fix; IconButton's brand variant has no other user.

## Rules
- **Read `lessons.md` first.** Applied here: L1 (scanner), L4 (ruling lines), L7, L10, L22, L23 (sweep), L26 (`b-round-504/doc-ledger.md`), L28, L29 (claims K1–K38), L31 (UT2 ruling), L36 (stubbed chat rows), L38 (warm-up, separate :5174), L39, L47 (focus targets and the async-settle guard), L52 (every jsdom row has a mutant), L56 (artifacts K38), L57, L58 (sketch review on the dispatched sha), L59 and L60. L54 does not apply: `/support` is not a purchase entry, exit or hand-off.
- **L47 (unmount names the focus target):**
  - "Start Chat" unmounts the form; the target is the message textarea.
  - "Send message" disables itself while focused; the target is the message textarea.
  - Both are rows (C7). HEAD measured BODY in both cases [K30]. They close B-R505-CHAT-SEND-FOCUS-LOST and B-R505-GUESTFORM-START-FOCUS-LOST.
  - **Async settle (L47, RETRO 495):** on `/support`, GuestForm stays mounted while `POST /api/chat/sessions` is in flight, and ChatInput mounts when it settles [K39]. So the mount focus moves focus only if focus is still on BODY. B2D-9 (mutant M15) and the browser in-flight row (C7) check it. `probe/m15-browser.out` shows that the browser row turns red without the guard.
  - **Not a target:** the signed-in open and the "Live Chat" click land on BODY at HEAD and on the sketch. That is the deferred B-R505-LIVECHAT-OPEN-FOCUS, not conformance; C records it and asserts only "not the textarea".
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte**, doc 326 included. A writes no prose this round.
- **Ruling lines (L4):**
  - **Send radius:** IconButton's `rounded-lg` (12 px, the textarea's radius) wins over the Button default shape. This is product-designer's alignment rule.
  - **Disabled Send:** IconButton's disabled `pointer-events-none` wins over HEAD's hover brightening and pointer cursor (the same class as PD-R504-DISABLED-NO-REASON).
  - **Send press:** IconButton has no `active:opacity`, so the press is the global scale 0.98 only. "Start Chat" adds the builder's `active:opacity-90` to the scale.
  - **Product-designer's draft C rows:** row 2's "8px corners" and row 6's file-wide "no `active:scale-95`" are superseded by C1 (Send radius `12px`) and C8 (K7: brand variant only; `default`/`ghost` keep it). tech-lead flagged both (sketch review findings 1–2); the tree and `sketch.out` are the oracle.
  - **`title` tooltip:** IconButton's `title={label}` adds a native tooltip "Send message". It is accepted as the quiet home (L39); no persistent text is added.
  - **Height:** "Start Chat" goes 50 → 48 px (the builder's `text-base` line height); the form card height is unchanged (337 px) [K29b].
- **Pre-ruled Lows** (a re-raise is listed "For B", not a STOP):
  - #1 B2D-1 and B2D-3 pin whole class strings or token sets (SIG-R501-SHARED-BUTTON-SCANNER).
  - #2 B2D-8 reads source text (no `<button` in the chat files; the IconButton brand array's tokens by regex).
  - #3 the `scrollIntoView` stub in the 2d test is assigned per test and not restored; jsdom has no native one.
  - #4 doc 326 l.4 says "C round 505 PASS" before C runs (L28 contract) [K17].
  - #5 `ChatButton` keeps its own glow and badge (dead file, LEGACY-DEAD-STORE-COMPONENTS).
  - #6 the native email validation bubble (B-R505-GUESTFORM-NATIVE-VALIDATION) is unchanged [K12, K33, K42].
  - #9 GuestForm and ChatInput import `Button`/`IconButton` from the `~/components/ui` barrel, as stages 2a–2c did (GATE498-L2-BARREL-IMPORT, `confirmedBy`).
  - #7 the "opened with guest form" flag is captured once per mount (TL-R505-FOCUS-FLAG-AUTH-CHANGE): a sign-out or sign-in while the window stays open can skip or add one focus move. On `/support` every open is a new mount.
  - #8 IconButton `default`/`ghost` keep `active:scale-95`, which compounds with the global 0.98 to about 0.931 (TL-R505-ICONBUTTON-SCALE-COMPOUND, info; no live user).
- **Purchase protection:** no auth, cart, checkout, ownership or download file is touched. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Persistent screen text (L39):** nothing is added or removed. Labels and icons are unchanged; the 16 px send icon becomes 20 px.
- **Out of scope:** Studio (`/studio-lab` is only smoke-checked in C12), `support.tsx`, `ChatHeader`, `ChatButton`/`ChatWidget`, 2e LeadMagnet, NONBRAND.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
HEAD is `e3e9e49` [K1] (gate 504 `commit`). The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-504/r505-tree-sha256.txt`: every tracked file except the seven granted tracked paths (1,412 of 1,419 [K23]).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files. No granted path is protected [K24].
3. Before applying: `b-round-504/r505-pre-sha.txt` (the seven granted tracked paths at HEAD).
4. After applying: `b-round-504/r505-post-sketch-sha.txt`, covering all nine paths.

B applied the patch to a fresh `git archive` of HEAD (`/home/runner/b504-patchgen`). All nine files are equal to the scratch tree (`/home/runner/b504-verify`), and check 4 passes there.

## 0. Why this round
- **Saba's DPG item 7:** "Use Button.tsx component only". Stages 1, 2a, 2b-1…2b-3 and 2c are done.
- **Stage 2d** is inventory row A4, the live chat on `/support`: the scanner count drops from 96 hits / 35 solid to 94 / 33 [K14].
- **Bugs first:** no Critical, High or Medium finding is open on the chat files. C 504 found 0 bugs. The two focus losses fixed here are pre-existing Lows on owned code (2026-10-23 rule: fixed early when the round owns the code and it costs little).
- **REGRESSION is not due:** the last one was 2026-11-13, and the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference
- **Store rule** (DESIGN_SYSTEM shape table and l.883 [K36]):
  - a form submit is default-shape (8 px), e.g. newsletter "Subscribe" and Hire Us "Send Message";
  - icon-only actions use `IconButton`; text and icon use `Button`.
- **Focus after send (practice, not a WCAG rule):**
  - Discourse chat merged "enforces focus of composer after send" ([meta.discourse.org/t/235136](https://meta.discourse.org/t/composer-loses-focus-and-keyboard-closes-after-sending-chat-message-on-android/235136));
  - Firefox OS messaging kept focus in the input after the send button ([bugzilla.mozilla.org 1033334](https://bugzilla.mozilla.org/show_bug.cgi?id=1033334)).
  - Searched 2026-11-14 (WebSearch); no formal WCAG/ARIA text names this case. WCAG 2.4.3 (focus order) is the governing criterion for not dropping focus to BODY.
- **Intercom/Zendesk/Crisp send-button shape:** no reference verified (product-designer said "not verified"; B did not find a primary source).
- **Ableton:** does not apply (Store page).

| Point | Reference / rule | CZABA after this round | Deviation (reason) |
|---|---|---|---|
| "Start Chat" | form submit, default shape | `<Button type="submit" size="lg" fullWidth>` | D1: radius 12 → 8 px, 50 → 48 px, padding `12px 16px` → `12px 24px`, `shadow-sm`, press opacity 0.9 |
| "Send message" | icon-only → IconButton | `IconButton` brand md 40×40, icon 20 px, `title` | D2: 36 → 40 px (the textarea's height), radius stays 12 px; D3: inert while empty (`pointer-events: none`) |
| Focus after send / after the guest form | composer keeps focus (Discourse, Firefox OS) | textarea | D4: HEAD dropped focus to BODY |
| Keyboard focus ring | the shared ring (SABA-B-4) | unchanged: `:focus-visible`, solid, offset 2 px | none |
| Focus moved elsewhere while the session starts | no focus steal after an async settle (L47) | focus stays where the user put it | none |
| Signed-in open, "Live Chat" click | the opener's focus target | unchanged from HEAD (BODY) | open: B-R505-LIVECHAT-OPEN-FOCUS, deferred |

## 2. What changes: sketch `b-round-504/sketch-505.patch.txt`
sha256 `5c0ed1957a97cc871dab743dd3624185e07afc7090523fb80f568f193741dfbe` (`b-round-504/sketch-sha.txt`; v1 `841657ad…` and v2 `f2e389b9…` are superseded, see `sketch-sha-history.txt`, `sketch-delta-v1-v2.diff.txt` and `sketch-delta-v2-v3.diff.txt`).

| File | Change |
|---|---|
| `app/components/chat/GuestForm.tsx` | the hand-rolled submit → `<Button type="submit" size="lg" fullWidth>Start Chat</Button>`; import `Button` from `~/components/ui` [K6] |
| `app/components/chat/ChatInput.tsx` | the hand-rolled Send → `<IconButton type="submit" variant="brand" size="md" label="Send message" disabled={disabled \|\| !value.trim()}>` with `<Send className="w-5 h-5" />`; a `textareaRef` on the textarea; `focusOnMount?: boolean` (default false) focuses it in an effect only while `document.activeElement` is BODY; `handleSubmit` focuses it after a send [K6, K10] |
| `app/components/chat/ChatWindow.tsx` | `const [isOpenedWithGuestForm] = useState(isGuestFormVisible);` and `<ChatInput … focusOnMount={isOpenedWithGuestForm} />` [K11] |
| `app/components/ui/IconButton.tsx` | `brand` variant → `['bg-brand text-background', 'hover:bg-brand-hover', 'shadow-sm']` (drops `active:scale-95` and `hover:shadow-glow`). `default` and `ghost` are unchanged [K7] |
| `app/lib/__tests__/store-glow-shadow.test.ts` | IconButton.tsx moves from `RETIRED_UTILITY_ALLOW_LIST` to `GRANTED_GLOW_FREE_SCRIPTS` [K16] |
| `app/lib/__tests__/store-undefined-tokens.test.ts` | IconButton.tsx leaves `NON_EMITTING_ALLOW_LIST`; UT2b's dead count 5 → 4 [K16] |
| `app/lib/__tests__/store-button-cleanup-2d.test.tsx` (new) | B2D-0 to B2D-9 (10 tests) [K25]: 0 = IconButton brand has no glow or scale-95, ghost keeps scale-95; 1 = "Start Chat" type submit, class = builder lg fullWidth; 2 = validation unchanged (empty → both errors, no submit; valid → one submit, trimmed); 3 = Send 40 px brand classes, `title`, disabled and inert when empty, 20 px icon; 4 = click send: once, trimmed, field cleared, focus on the textarea, Send disabled; 5 = Enter sends once with focus unchanged, Shift+Enter and blank send nothing; 6 = `focusOnMount`; 7 = ChatWindow focuses only on guest form → chat; 8 = source pins (no `<button`, one `Button`, one `IconButton`; the brand array's tokens by regex); 9 = the mount focus does not take focus from an element outside BODY (guard unit test) |
| `docs/design/DESIGN_SYSTEM.md` | the default row of the shape table adds "chat-ის guest form-ის „Start Chat“ (`lg`, `fullWidth`)"; a paragraph after the IconButton size table describes the `brand` variant and its Store use [K19] |
| `docs/implementation/2026/quarter-IV/326-dpg-button-cleanup-stage-2d.md` (new) | l.4 `**სტატუსი:** In Progress (stage 2d of DPG-BUTTON-CLEANUP-2; C round 505 PASS)` [K17]; the 7 TEMPLATE headings; D1–D4; the TODO list |

**Sweep (L23)** [K15]: the test-root hits are `store-focus-ring`, `store-glow-shadow`, `store-theme-tokens` and `store-undefined-tokens`. All four are in the covering set and green on the sketch. Two needed the grants above (`store-undefined-tokens` UT2/UT2b went red on the first sketch, `b-round-504/checkpoint.md` step 6). `store-focus-ring` lists the chat files as ring-free (kept) and its l.303 is a fixture string [K37]. `store-theme-tokens` F16/G1/G2 pin the textarea and input borders (unchanged). No e2e spec names the chat labels.

**L31 timeout headroom** [K34, K40]:
- No covering file declares its own timeout, and `vitest.config.ts` sets no `testTimeout`, so every test runs under the 5 s default.
- UT2 in `store-undefined-tokens` is over 50 %. It took 2,179 ms on B's idle scratch run, but gates 500–504 measured it at 2,813, 2,356, 3,654, 2,893 and 3,186 ms (47–73 %). This is pre-existing: the sketch only removes one allow-list entry and adds no scan work.
- **Ruling:** UT2 is exempt from the 2,500 ms line below, and its time is recorded. It is filed as B-R505-UT2-TIMEOUT-HEADROOM (Low; a test-only split or a declared timeout, scheduled if any gate run exceeds 4,000 ms).
- Every other covering test is under 400 ms.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-504/sketch-505.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 9 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-505/`. Each expected value is B's sketch output, and a difference is a STOP:
   - `npm run typecheck`: rc 0 (`typecheck.log`; B: `b-round-504/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 179 warnings." (`lint.log`; B: `precheck-lint.log`) [K26].
   - `npx biome check app/components/chat/GuestForm.tsx app/components/chat/ChatInput.tsx app/components/chat/ChatWindow.tsx app/components/ui/IconButton.tsx app/lib/__tests__/store-button-cleanup-2d.test.tsx app/lib/__tests__/store-glow-shadow.test.ts app/lib/__tests__/store-undefined-tokens.test.ts`: rc 0, "Checked 7 files", no fixes (`biome-scoped.log`; B: `precheck-biome.log`) [K26].
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-504/covering-files.txt)`: 6 files, 80/80, with the B2D-0…B2D-9 lines present, and no test above 2,500 ms except UT2 (record its time) (`covering.log`; B: `precheck-covering.log`).
   - The code-reviewer on the whole change against `e3e9e49`. Give it `git diff e3e9e49` and the two untracked files.
   - Not run by A: the full suite and the build. B ran both on the sketch tree: `precheck-full.log` (302 files / 4,373 tests, rc 0) and `precheck-build-sketch.log` (rc 0) [K27].
4. Write `a-round-505.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-505.md`, `c-round-505.json` and `c-round-505/progress.json` as it goes, heaviest rows first (L59).

**Stubbed rows (L36):** the chat rows after "Start Chat" are **-STUBBED**. Playwright `page.route` answers `POST /api/chat/sessions` and `POST /api/chat/sessions/{id}/messages`, and aborts the SignalR hub `/hubs/chat` (so `connect()` fails, as it does in the cloud, and the session stays set). The guest form and "Start Chat" validation run unstubbed. These rows prove the client path only. The real-backend half (a real session, SignalR, admin replies) is **BLOCKED: backend unavailable in cloud** and goes under `blocked`. That does not make `browserVerified` false.

**Environment:**
- The store dev server at `http://127.0.0.1:5173`. `/support` needs no mock API.
- **Warm up (L38):** load `/support` once and wait for the "Live Chat" card before measuring (`node b-round-504/probe/warm.mjs` with `BASE`). A cold first run that times out or finds 0 targets is environment-invalid and is replaced.

**Harness** (under `b-round-504/probe/`, `BASE=http://127.0.0.1:5173`):
- `node support-505.mjs <c-round-505/after> after` covers 1440×900, 1280×720 and 375×812 (anonymous), then a signed-in pass (stubbed `localStorage.auth_user` without `accessToken`) at 1440 and 375. Per viewport it reads "Start Chat" and Send (rest, hover, mouse press, keyboard focus with padded crops), runs the validation steps, starts the stubbed session, and sends by click, Enter, double-click, blank and keyboard (Tab to Send, Enter), recording each POST and `document.activeElement`. It also runs an in-flight pass at 1440: the session POST is held 1.5 s, and focus is moved to "Back to support options" during the flight. It records `during`, `after` and `send`.
- `node native-validity.mjs` (with `BASE`) records the native email validation (deferred, unchanged).
- The oracles are `probe/sketch.out` and `probe/sketch/sketch.json`. The HEAD values are `probe/head.out` and `probe/head/head.json`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 7 modified (the §2 tracked paths) and 2 untracked (the 2d test, doc 326). Checks 1, 2 and 4 rc 0 |
| C1 | REST | `support-505.mjs` `start`, `sendEmpty`, `sendReady` | Equal to `sketch.out` (boxes ±1 px) [K29]. "Start Chat": `BUTTON type submit`, 398×48 (261×48 at 375), bg `rgb(201, 164, 106)`, color `rgb(14, 13, 12)`, 16px / 600, padding `12px 24px`, radius `8px`, shadow ending `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px`. Send: 40×40, radius `12px`, `title` and `aria-label` "Send message", svg 20×20; empty → `disabled` true, opacity `0.5`, `pointerEvents` `none`; ready → enabled, opacity 1. The form row stays 40 px tall (`form.h` 40) |
| C2 | HOVER + PRESS | `hover`, `press`, `sendEmptyHover` | "Start Chat" and ready Send hover bg `rgb(217, 184, 127)`. Empty Send: the element under the pointer is not the button (`topIsButton` false) and its bg stays `rgb(201, 164, 106)`. Press: "Start Chat" opacity `0.9` + `matrix(0.98, …)`; Send opacity `1` + `matrix(0.98, …)`. `press.focusVisible` false |
| C3 | KEYBOARD FOCUS | `focus` fields plus the `*-focus.png` crops | `focusVisible` true, outline `solid` with offset `2px` on "Start Chat" and Send at all 3 viewports (equal to HEAD). At least 2 crops viewed (one per target), ring visible and not clipped |
| C4 | CONTRAST | `restContrast` / `hoverContrast` | 8.32 / 10.28 on "Start Chat" and ready Send. A failure is a Medium |
| C5 | VALIDATION (unstubbed) | `steps.emptyErrors`, `postsAfterEmpty` | Empty "Start Chat" click shows "Name is required" and "Email is required" and sends 0 POSTs, at every viewport (equal to HEAD). `badEmailErrors`/`fieldValues` equal `sketch.out` (pre-ruled Low #6). `native-validity.mjs` output equal to `probe/native-validity-head.out` and `probe/native-validity-sketch.out` [K42] |
| C6 | SEND + POST COUNT (stubbed) | `steps` | Per viewport: `postsAfterStart` = `["sessions"]`; `clickSend`, `enterSend`, `dblSend` and `kbdSend` exactly one `messages:` POST each with the typed text; `whitespaceSend` `[]`; `taValueAfter` `""`; `messagesShown` 3. Equal to `head.out` and `sketch.out` [K31] |
| C7 | FOCUS TARGETS (L47) | `steps.activeAfterStart`, `activeAfterClickSend`, `kbdTabTarget`, `kbdAfter`; signed-in rows | Per viewport: after "Start Chat", `TEXTAREA` "Type a message..."; after a mouse send, `TEXTAREA`; Tab from the field lands on "Send message", and after Enter on it focus is the `TEXTAREA` with `focusVisible` true and outline `solid` (keyboard source). Screenshot `after-1440-kbd-after-send.png` viewed (ring on the field). In-flight row (session POST held 1.5 s, focus moved to "Back to support options" during flight): `after` is that button, not the `TEXTAREA`, and `send` is 1. This is equal to `sketch.out`; `probe/m15-browser.out` shows the red case. Signed-in open: `guestForm` 0, `send` 1, and `active` is not the `TEXTAREA` (record its tag; HEAD and sketch BODY, B-R505-LIVECHAT-OPEN-FOCUS). `activeAfterLiveChat` is record-only [K30, K32] |
| C8 | GREP | from `store/`: `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/scan-brand.py . /tmp/s.json`; the K5–K11 and K16 lines of `claims-505.sh` | `94 hits; 33 solid` (HEAD 96 / 35) [K14]; K5 `0 0 2`; K6 `1 1 1`; K7 `1 0 2`; K10 `1 1 2 4`; K11 `1 1`; K16 `0 1 0 expect(dead).toHaveLength(4)` |
| C9 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-504/covering-files.txt)` | 6 files, 80/80; the B2D-0…B2D-9 lines present; no test above 2,500 ms except UT2 (time recorded; B-R505-UT2-TIMEOUT-HEADROOM) |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/`, symlink `node_modules`, then run `python3 -I b-round-504/mutants-505.py <copy> <absolute c-round-505/mutant-logs>` | M1–M15 all RED, each on the rows in `b-round-504/mutants-505.txt` (`summary.txt` lines end `OK`), and `restored rc 0` |
| C11 | DOCS | `git diff e3e9e49 -- docs/design/DESIGN_SYSTEM.md`; doc 326 | DESIGN_SYSTEM: the default row changed and one paragraph added after the IconButton size table [K19]. Doc 326: the 7 headings (L26 subsequence) and l.4 byte-equal to `**სტატუსი:** In Progress (stage 2d of DPG-BUTTON-CLEANUP-2; C round 505 PASS)`. Every number in doc 326's D1–D4 traced to `probe/head.out` or `probe/sketch.out`. `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 |
| C12 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C13 | CLAIMS | `bash b-round-504/claims-505.sh` (default tree), compared with `b-round-504/claims-505-sketch-output.txt` | No `MISSING`. Output identical except K1 (HEAD may move to the loop-state commit) and K2 (the sketch output read the clean store) |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-505.json c-round-505/l57-check.txt` | As C0; rc 0. The JSON carries all L57 fields. `mutantRedOnSketch` names `b-round-504/mutants-505.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** CHAT-REAL-BACKEND-505, a real chat session, SignalR and admin replies ("backend unavailable in cloud").
- **Neighbours that could break:**
  - the guest form's validation and the session start (C5, C6);
  - Enter-to-send and Shift+Enter (C6, B2D-5);
  - the support cards and "Back to support options" (untouched; C12 screenshot of `/support` before "Live Chat" optional);
  - other IconButton users: none at HEAD; ChatInput is the only one on the sketch [K41].
- **L22:** if A STOPs, C runs C0, C13 and C14 only.
- **Closing:** with C PASS and `browserVerified` true, stage 2d is verified (ChatButton stays open under LEGACY-DEAD-STORE-COMPONENTS).

## 5. B's pre-check (`b-round-504/`, on `/home/runner/b504-verify` = a `git archive` of HEAD plus the dispatched sketch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome (6 code and test files) | rc 0 / rc 0, 179 warnings (= HEAD) / rc 0, no fixes | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests (v3) | 6 files, 80/80 (UT2 2,179 ms; every other test < 400 ms) | `precheck-covering.log` |
| Full suite on the v3 sketch tree | 302 files / 4,373 tests, rc 0 | `precheck-full.log`, `precheck-full-raw.log` |
| Build on the v3 sketch tree | rc 0 | `precheck-build-sketch.log` |
| Browser, HEAD (:5173) vs sketch (a second dev server on :5174, own node_modules dir without `.vite`) | §1 table, C1–C7, in-flight row | `probe/head.out`, `probe/sketch.out`, `probe/native-validity-head.out` |
| Mutants (on a separate copy of the v3 sketch tree) | M1–M15 RED on their expected rows; `restored rc 0`. Browser mutant M15 (guard removed in scratch, restored): `probe/m15-browser.out` | `mutants-505.txt`, `mutant-logs/` |
| Scanner | 96/35 → 94/33 | `scan-head.json`, `scan-sketch.json` |
| Patch reproduces the tree | `git apply` on a fresh `git archive` of HEAD: all 9 files equal to the scratch; check 4 rc 0 there; check 1 rc 0 on `store/` | (this table) |
| Sketch review | tech-lead v1 `841657ad…` APPROVE WITH CONDITIONS (Mediums 1–2 = product-designer draft rows, ruled in §Rules; Lows 4–5 fixed in v2; Low 3 and the scale info deferred); v2 APPROVE; v3 review 3 REQUEST CHANGES (dead-path premise) → review 4 **APPROVE** on the dispatched sha | `sketch-review.md` |
| Doc ledger (L26) | every doc 326 sentence mapped; no contradiction with open findings | `doc-ledger.md` |
| Claims | HEAD and sketch outputs, no MISSING | `claims-505-planning-output.txt`, `claims-505-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **2e LeadMagnet** (keep-list restyle only; the ST5 pin is a row; product-designer rules the two brass actions and the `bg-destructive` CONTINUE submit stays). Then **NONBRAND** (including the PurchaseHeader siblings at 8 px and `support.tsx`'s cards) and PD-R498-404-SECONDARY-ALIGN.
3. At the stage-2 close: decide SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER. A bounded frontend-architect checkpoint goes to root only if that proposes a new ui primitive.
4. Then the rest of DPG P1 (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. RETRO at round 510.

## Claims (`b-round-504/claims-505.sh`; planning output `claims-505-planning-output.txt` on HEAD, sketch output `claims-505-sketch-output.txt` on `/home/runner/b504-verify`)
K1 HEAD · K2 worktree counts · K3 chat importers · K4 ChatWidget/ChatButton importers · K5 hand-rolled `<button` counts · K6 new forms · K7 IconButton brand line / glow / scale-95 · K8 IconButton md size / title / disabled classes · K9 Button.tsx lg / default shape / fullWidth / disabled · K10 ChatInput focus code · K11 ChatWindow capture · K12 noValidate / email type · K13 chat API paths · K14 scanner · K15 SWEEP · K16 token-test allow-lists · K17 doc 326 l.4 and headings · K18 docs 320–326 · K19 DESIGN_SYSTEM phrases · K20 pending grep · K21 gate 504 and c-round-504 · K22 c-round-504 L57 · K23 frozen list sizes · K24 granted paths not protected · K25 new rows · K26 lint/Biome/tsc · K27 full suite/build · K28 mutants · K29 probe key values · K30 focus targets · K31 POST counts · K32 signed-in no autofocus · K33 native validation · K34 L31 timings · K35 L58 check · K36 DESIGN_SYSTEM l.883 · K37 focus-ring l.303 · K38 cited artifacts exist · K39 live async session path · K40 UT2 gate timings · K29b form card 337 px rows · K41 IconButton importers · K42 native validation sketch = HEAD.
