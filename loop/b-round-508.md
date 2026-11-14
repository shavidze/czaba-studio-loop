# B: planning from round 508 to round 509 (2026-11-14)

**Decision: CONTINUE.** Round 509 is B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD. The decisions are D-29z1837 to D-29z1840 (`backlog.json` v513).

## How round 508 was accepted (C evidence only)
- **C passed it.** `c-round-508.json` has `taskStatus` PASS, `browserVerified` and `realVerified` true, C0–C12 passed and 0 bugs.
- **Gate 508 published `cf89736` on both remotes.** That commit is round 509's baseline. The gate's `head` field (`3021b30`) is the pre-commit head.
- **What closed:**
  - NONBRAND stage N1 (AudioPlayer) is verified;
  - A-R507-CR-1, CR-2 and CR-4 are closed.
- **Archived:** `tasks/round-508.md` (a copy). The before-copies are in `b-round-508/`.
- **Follow-ups (D-29z1838):**
  - **A's X1** (the icon threshold drifting from the label threshold) is ruled to fall inside pre-ruled #13. It becomes the deferred Low A-R508-CR-VOLUME-ICON-UNPINNED.
  - **Deferred Lows:** A-R508-CR-MUTE-LOW-VOLUME-CLICK, A-R508-CR-USEAUDIO-MOCK-UNTYPED, and gate Lows GATE508-L1, L2 and L3. Gate L4 re-raises pre-ruled #3, so it gets no new id.
  - **C's observations:**
    - the 1 px ring is recorded as `confirmedBy` on INFO-C502-CHECKOUT-RING-1PX;
    - the teal hero becomes INFO-C508-HERO-MEDIA-TEAL. The colour comes from the hero media, not CSS: an app-wide teal grep finds only the frozen legacy `StudioTrack.tsx` l.155.

## Round 509 plan
- **The bug reproduces in the browser.** The mock has no free product, but stubbing the client-navigation `_data` request works:
  - in `b-round-508/probe/free-stub.json`, the button is a `BUTTON` with no `href` or `type`;
  - a click changes nothing: 0 dialogs, 0 errors.
  - So the free half of ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE is not needed.
- **product-designer ruling (a)** (`b-round-508/consult-product-designer.md`): the button becomes "Get it free" and runs the Buy Now handler.
  - The handler is extracted unchanged into `app/hooks/useBuyNowAction.ts` and shared with PurchaseHeader.
  - The button shows only for a $0 **selected** version that is sellable and not owned. This also fixes a second defect: the sidebar used the Standard price.
  - It becomes `Button` primary lg fullWidth `type=button`, which lands NONBRAND scanner hit l.75 in the same edit.
- **Grants:** 7 paths. `CartContext.tsx`, every protected file and `/free-downloads` are untouched.
- **Browser rows for C:**
  - anonymous, keyboard, version switch, paid (unstubbed), signed in and owned (STUBBED with the `journey-504` harness), and a journey row;
  - the real $0 order is BLOCKED by the backend (new FREE-CHECKOUT-REAL-BACKEND, Medium, does not block the loop).
- **No byte sketch this round.** The numbers B did not run on a sketch are marked **record** (L58). The mutants MA–MI each name the row they must turn red.

## Saba (D-29z1840): `user-review/questions-round-509.md`
- **SABA-Q-509-FREE-DELIVERY:** the shipped default is a $0 order through checkout after sign-in.
- **SABA-Q-509-BUYNOW-FREE-LABEL:** the header is unchanged this round, as the smallest change.
- **Why:** this is the smallest honest behaviour. The button does what its label says, through an existing path, and it adds no new download path.

## Architecture
- **Signal SIG-R508-PLAYER-VOLUME-CONTROL** (VolumeIcon/PlayerVolumeControl extraction) is a signal only.
- **No checkpoint request.** Round 509 adds one small hook. The product page owner is not accumulating structural risk: the change moves code, and no new state is added.

## Gates and timing
- **REGRESSION** is due on or after 2026-11-16, so not yet.
- **RETRO** is round 510.
- **Purchase protection:** protected sha check rc 0. No ownership or download path changes. C12 keeps the anonymous "Sign in required" row.

## Advisor and consults
- **Advisor:** called before planning. Its advice was followed:
  - checked that a $0 price is valid, so the branch is reachable;
  - ran the stub probe that was due;
  - consulted product-designer with constraints;
  - landed the migration in the same edit;
  - covered round 508's closures, the X1 ruling and the gate Lows, and grepped C's observations against the backlog.
- **product-designer:** consulted once; its ruling is above.
- **Not consulted:** tech-lead, performance-optimizer and ableton-arrangement-expert. Their areas do not apply: this is a Store change with no performance or Ableton aspect.
- **Root files:** nothing new to fold in.

## Ready for commit?
- Round 508 is already published (`cf89736`).
- Round 509 is not implemented yet.

## Closing check: second advisor pass (D-29z1841)
- **L23 scratch run.** On an archive of `cf89736`, B extracted the hook, moved PurchaseHeader onto it and replaced the sidebar button with `Button`, at `/home/runner/b508-scratch`, outside `store/`.
  - tsc: rc 0.
  - Full suite: 304 files, with only PU7 failing. PU7 is granted and is rewritten in the task (`b-round-508/scratch-full.log`).
- **Task fixes:**
  - one shared `isSellableVersionName` predicate;
  - `isAddingToCart` parity with header Buy Now (SF4, mutant MJ);
  - the `new-hook.md` barrel item is pre-ruled as not done (K13: 13 exports, 18 hook files);
  - pre-ruled Lows #1–#7;
  - C1 height and C6 counts are marked **record**.
- **HEAD focus probe** (`probe/focus-head.json`). After Buy Now → Enter, the sign-in modal has no `role=dialog`, and focus stays on the trigger (`fv` true).
  - C3 now asserts that HEAD behaviour for "Get it free".
  - New Medium B-R509-AUTHMODAL-NOT-A-DIALOG. It is pre-existing, added to SYS-R495-SHARED-DIALOG (blocked by root), and does not block round 509.
- **Saba file** renamed to `user-review/questions-round-509.md`, following the convention. Q3 SABA-Q-509-FREE-LABEL-WORDING was added.
- **Reference:** B searched the research folder for free-product handling and found 0 files. This is recorded in §1.
- **Claims:** `b-round-508/claims-509.sh` K1–K14, no MISSING (`claims-509-planning-output.txt`).
