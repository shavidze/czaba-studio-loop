# B round 504 → 505 planning (2026-11-14)

**Decision: CONTINUE.** Next task: round 505, DPG-BUTTON-CLEANUP-2 stage 2d (the live `/support` chat). It is in `current-task.md`.
- **Advisor:** available. Consulted after orientation and at the closing check.
- **Archive:** `tasks/round-504.md` is a byte-identical copy of the round-504 task (`cmp` rc 0).
- **Baseline:** gate 504 `published`, commit `e3e9e49` (both remotes). The store worktree was clean at planning and is clean at the end.
- **Checkpoint:** `b-round-504/checkpoint.md`. Snapshots taken before editing: `b-round-504/*-before-505.*`.

## 1. Round 504 acceptance (from C's evidence only)
- `c-round-504.json`:
  - PASS, with `browserVerified` and `realVerified` true and 0 bugs;
  - C0–C14 passed;
  - `c-round-504/l57-check.txt` says L57 OK.
- Owner states and purchase journeys were `-STUBBED` (L36). One cold run was replaced (L38).
- The real-backend half is kept as open evidence under **PURCHASE-REAL-BACKEND** (`open_backend`).
- Gate 504 is published, and the review is COMMIT OK.
- **Stage 2c (PurchaseHeader) is verified (D-29z1817).** DPG-BUTTON-CLEANUP-2 stays in progress.

## 2. Follow-ups (L7, D-29z1818)
| Source | Item | Ruling |
|---|---|---|
| A CR-1 | redundant `not.toContain('text-black')` | new deferred info A-R504-CR-1-REDUNDANT-TEXT-BLACK |
| A CR-2 | B2C-5 disabled click has no own mutant | new deferred Low A-R504-CR-2-DISABLED-CLICK-NO-MUTANT |
| A CR-3 | `Link` mock partial | `confirmedBy` A-R503-CR-3-STUBCATALOG-DRIFT |
| A CR-4, gate Low 1 | disabled cursor never shows | `confirmedBy` PD-R504-DISABLED-NO-REASON |
| Gate Low 2, Architecture note | whole-string pins; shared scanner helper | `confirmedBy` SIG-R501-SHARED-BUTTON-SCANNER (decided at the stage-2 close, not auto-scheduled) |
| Gate Low 3 | doc 325 "In Progress" | multi-stage L28 contract, no id |

## 3. Why stage 2d next
- **Open bugs:** no Critical, High or Medium finding is open on Store code the loop can change. The open Mediums are root-only, Saba-only, device-only or `awaiting_user`, as in `context/active-summary.md`. B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) needs a backend endpoint and the protected `auth.ts`, so it stays with root.
- **REGRESSION** is due on or after 2026-11-16, so it is not due yet. RETRO is at round 510.
- The DPG-FIX P1 order is 2d → 2e → NONBRAND → CSS-DEDUP / COLOR-CONSOLIDATE / FONT-RESOLVE → DP gate → P2.

## 4. Stage 2d planning summary
- **Liveness:**
  - `GuestForm` and `ChatInput` are live only through `/support` → "Live Chat" → `ChatWindow`.
  - `ChatButton` is dead: `ChatWidget` is imported nowhere. It is not migrated and stays under LEGACY-DEAD-STORE-COMPONENTS, so A4 is not fully closed.
  - The `support.tsx` buttons are NONBRAND.
- **Product-designer** (`b-round-504/consult-product-designer.md`):
  - "Start Chat" → `Button` `lg` `fullWidth`, default shape.
  - Send → `IconButton` `brand` `md`, with a 20 px icon. Its `brand` variant drops the retired glow and its own `scale-95`.
  - Focus moves to the message field after a send, and when the guest form gives way to the chat. Both are WCAG 2.4.3 fixes in owned code, filed as B-R505-CHAT-SEND-FOCUS-LOST and B-R505-GUESTFORM-START-FOCUS-LOST and dispatched in this round.
  - **L47 async settle (closing check, D-29z1822):** on `/support`, ChatInput mounts when the session request settles, so the mount focus moves focus only from BODY. This is covered by B2D-9 and the in-flight browser row. `probe/m15-browser.out` is red without the guard.
  - `noValidate` is deferred, because on its own it would be worse for screen readers.
- **HEAD vs sketch probes** (Chromium, 1440/1280/375; `b-round-504/probe/head.out`, `sketch.out`):
  - "Start Chat": 398×50 at 12 px → 398×48 at 8 px.
  - Send: 36×36 → 40×40. It stays at 12 px, like the textarea, and is inert when empty.
  - Focus after Start Chat, after a mouse send and after a keyboard send moves from BODY to TEXTAREA. The keyboard ring is visible.
  - Each send makes 1 POST, whether by click, Enter, double-click or keyboard.
  - Opening the chat while signed in leaves focus on BODY in both trees. C records this; it is the deferred B-R505-LIVECHAT-OPEN-FOCUS, not conformance.
- **Native validation** (`native-validity-head.out`): with a bad email, the browser's bubble blocks submit and the styled error never shows. This is deferred as B-R505-GUESTFORM-NATIVE-VALIDATION.
- **Sketch:** v3 `5c0ed195`, 7 tracked files and 2 new. History: v1 `841657ad`, v2 `f2e389b9`.
  - The first sketch turned `store-undefined-tokens` UT2/UT2b red, so that file is granted (L23).
  - tech-lead v1 was APPROVE WITH CONDITIONS. Its two Mediums were product-designer's draft C rows, which the task's own C1/C8 supersede, and the task says so. Lows 4–5 are fixed in v2. The v2 delta is APPROVE.
  - v3 review 3 was REQUEST CHANGES, reasoned from the dead `ChatWidget`. After the live-path evidence, review 4 is **APPROVE**.
- **Pre-check on the v3 sketch:**
  - tsc rc 0, lint 179 (= HEAD), Biome clean;
  - covering 6/80. UT2 took 2,179 ms here and 2.4–3.7 s at gates 500–504, so it is ruled and filed as B-R505-UT2-TIMEOUT-HEADROOM; every other test is under 400 ms;
  - full suite 302 files / 4,373 tests, rc 0, re-run clean after a scratch overlap; build rc 0;
  - mutants M1–M15 red on their expected rows;
  - scanner 96/35 → 94/33;
  - the v3 patch applied to a fresh `git archive` of `e3e9e49` passes check 4 and equals the scratch tree; native validation on the sketch equals HEAD (K42);
  - claims K1–K42 with no MISSING; L58 OK; doc ledger `b-round-504/doc-ledger.md` (L26).
- **Probe fix (closing check):** the ready Send "rest" read had the pointer still on it. That is fixed, and the ready Send rest is now 8.32 with hover 10.28.
- **New backlog ids:**
  - CHAT-REAL-BACKEND (`open_backend`);
  - dispatched: B-R505-CHAT-SEND-FOCUS-LOST, B-R505-GUESTFORM-START-FOCUS-LOST;
  - deferred: B-R505-GUESTFORM-NATIVE-VALIDATION, B-R505-CHAT-TEXTAREA-NO-LABEL, B-R505-LIVECHAT-OPEN-FOCUS, TL-R505-FOCUS-FLAG-AUTH-CHANGE, TL-R505-ICONBUTTON-SCALE-COMPOUND (info), B-R505-UT2-TIMEOUT-HEADROOM;
  - notes: GATE453-L2-L3-INERT-GLOW-CLASSNAMES and B-R455-GS2-DEAD-LABELS-UNVERIFIED lose their IconButton halves; GATE498-L2-BARREL-IMPORT `confirmedBy` the chat barrel imports;
  - B-R478-DEAD-LICENSE-LINK gains the `support.tsx` "License Info" site as a note.
- **Architecture:** no checkpoint. This is one owner (chat) with a component swap and a focus fix. Signals stay recorded: SIG-R501, SIG-R498, and the IconButton scale compounding.

## 5. Files written by B
- `current-task.md` (round 505), `tasks/round-504.md` (archive)
- `backlog.json`:
  - v503 → v506 (update-1: acceptance; update-2: dispatch; update-3: closing check);
  - scripts and `.done` markers in `b-round-504/`.
- `feature-status.md`: header, the round 504/505 lines, and the DPG-FIX row.
- `b-next.json`
- `b-round-504/`: sketch v1 and v2, sketch-review, consult, probe, mutants, claims, pre-check logs, frozen lists `r505-*.txt`, `covering-files.txt`.
- **Scratch trees outside `store/`:** `/home/runner/b504-verify`, `/home/runner/b504-patchgen` and `/home/runner/b504-mut`. The sketch dev server on :5174 was stopped.

## 6. Ready for commit
Root has nothing new to commit from B. Round 504 is already published at `e3e9e49`.
