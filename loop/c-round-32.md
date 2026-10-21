# C — Round 32 verification (C-R31-02, C-R31-01, R31-U-GAP-B2; D-29w)

Verifier: C · თარიღი: 2026-10-13 · Server `http://127.0.0.1:5173/studio-lab` 200 · Browser: gstack `/browse`, state `c-browse.json`, ახალი anonymous context (`auth_user` null, cookie ''), 1440×900.
Artifacts: `c-round-32/` (gates/, runs/, shots/, scripts/, checkpoint.md). App source არ შემიცვლია; mutation-ები მხოლოდ `c-round-32/mut/`-ში (junction მოხსნილია, `diff -r` = იდენტური).

## ვერდიქტი: **FAIL** — ერთი ახალი Medium ბაგი (C-R32-01)

A-მ dispatch-ი ზუსტად შეასრულა: guard-ი, suppression-ი, ტესტები და doc შეესაბამება კოდს, mutation-ები (a)–(g) ტესტებს აგდებს. **თუმცა რეალური click-ების თანმიმდევრობაში ახალი guard-ი Delete-ს ჩუმად თიშავს**: clip-ზე ან ცარიელ lane-ზე click focus-ს fader-იდან არ აშორებს, ამიტომ fader-ის ნებისმიერი გამოყენების შემდეგ Delete/Backspace აღარ მუშაობს. ეს არღვევს §0-ის „Delete on clip / lane body — Unchanged“ რიგს, ამიტომ R32-DK = FAIL.

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| G32-1 | PASS | gates/ |
| G32-2 | PASS | gates/ |
| G32-3 | PASS | gates/network-*.txt, anon-*.json, curl-token.txt |
| R32-DK | **FAIL (C-R32-01)**: table-ის ყველა რიგი ცალკე გადის | runs/dk*.txt |
| R32-BC | PASS | runs/bc-*.txt |
| R32-K | PASS | runs/k-*.txt |
| R32-S | PASS | gates/snap-*.diff |
| R32-U | PASS | runs/r32u-* |
| R32-Doc | PASS | doc 036 §Round 32 |

## C-R32-01 (Medium, ახალი; round 32-ის guard-ის შედეგი)

**ნაბიჯები (real `$B click`/`$B press`):**
1. L32.
2. Real click music Volume fader-ზე (value 0.5, +1 `Volume`) ან `focus()`.
3. Real click Soft impact clip-ზე: clip მოინიშნა, `activeElement` კი ისევ `Volume — მუსიკა`-ა.
4. `Delete` → **არაფერი**: არც წაშლა, არც entry, არც status.

იგივე ხდება ცარიელ SFX lane body-ზე click-ის შემდეგ (`dk-focus-retention.txt` D) და Pan-ზეც (`dk.txt` row 6, `bc-pid1-realclick.txt`).

- **Control:** focus body-ზე → clip click → Delete შლის (A, `dk2.txt`).
- **მიზეზი (კოდის კითხვით):** `ArrangementClip.tsx:228` `beginGesture` pointerdown-ზე `preventDefault()`-ს იძახებს, ამიტომ ბრაუზერი focus-ს არ ცვლის. lane body `tabIndex=-1`-ია. ახალი `isRangeInputTarget(event.target)` კი stale focused range-ს ხედავს.
- **regression-ის ზუსტი მოცულობა:** Volume/Master/Zoom-ზე ეს თანმიმდევრობა round 32-მდე clip-ს შლიდა (C-R31-02-ის repro), ახლა კი აღარ მუშაობს. Pan-ზე ის round 32-მდეც არ მუშაობდა (deviation 1-ის `stopPropagation`), ამიტომ Pan-ის ქცევა არ შეცვლილა.
- **თანმიმდევრობა:** dispatch-ის თანმიმდევრობა (clip click → fader `focus()` → Delete) გადის. საპირისპირო (fader → clip/lane click → Delete) ჩავარდა. ეს spec-ის ხარვეზია, რომელიც რეალურმა ინტერაქციამ გამოავლინა; acceptance table-თან უთანხმოება არ არის.
- **მოსალოდნელი:** clip-ზე ან lane-ზე click-ის შემდეგ Delete მონიშვნაზე მოქმედებს (SRW-24).
- **გადაწყვეტა B-ისთვისაა:** მაგალითად clip/lane pointerdown-ზე focused range-ის blur, ან guard-ის შეზღუდვა. C კოდს არ წერს.
- **ტესტის ხარვეზი:** `fader-guards.test.tsx` focus-ს პირდაპირ აყენებს და clip-ზე pointerdown-ით focus-ის შენარჩუნებას არ ამოწმებს.

## R32-DK (key-step tables: `runs/dk.txt`, `dk2.txt`, `dk-srw24.txt`, `dk-gesture-blocked.txt`, `volume-delete-key-rerun.txt`)

Clip table L32: `[music 7 16] [sfx 4 2] [video 0 6.008]`, past 3. node.exe 8.

| Control (focus → real Delete, Backspace) | clips | past | status | value | ვერდიქტი |
|---|---|---|---|---|---|
| music Volume | უცვლელი | 3→3→3 | უცვლელი | 1 | PASS |
| SFX Volume | უცვლელი | 3 | უცვლელი | 1 | PASS |
| Master Volume | უცვლელი | 3 | უცვლელი | 0 | PASS |
| Zoom | უცვლელი | 3 | უცვლელი | 678 | PASS |
| music Pan | უცვლელი | 3 | უცვლელი | 0 | PASS |
| body focus + selected clip (clip `tabIndex -1`, focus BODY) | sfx წაიშალა | 3→4 `კლიპის წაშლა`, „სიცარიელე დარჩა“ | — | — | PASS (Delete და Backspace; Undo → 3) |
| playhead (`role=slider`) | sfx წაიშალა | 3→4 | — | — | PASS (ორივე კლავიში) |
| overview (record) | **sfx წაიშალა**, 3→4 | | | | record only |
| library preview scrubber (record) | **sfx წაიშალა**, 3→4 | | | | record only |
| gesture-blocked (synthetic clip hold) + focused Volume | უცვლელი, past 3 | status „რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“ | | | info |
| SRW-24 range 9–11 (music) + body → Delete | music 7/2 + 11/12(off 4), `წაშლა მონაკვეთზე` | | | | PASS |
| Ctrl+Shift+L → Delete | `წაშლა მონაკვეთზე (ყველა ხაზი)`, gap | | | | PASS |
| Ctrl+Shift+L → Ctrl+Shift+X | music 7/2 + 9/12, `Cut Time`, „სიცარიელე დაიხურა ყველა ხაზზე“ | | | | PASS |
| R31 repro (`volume-delete-key`) | clip რჩება | | | | PASS |

`dk.txt`-ის must-delete ნაწილი harness-ის მიზეზით არავალიდურია: focus Pan-ზე დარჩა და C-ის Ctrl+Z-მა add-ები გააუქმა. სწორედ ამან გამოავლინა C-R32-01. ამ რიგებში `[browse] The operation timed out` ხაზები harness-ის ხმაურია. გვერდი ახლიდან ავაწყე `reset.sh`-ით.

## R32-BC (synthetic pointer / blur; `setTargetAtTime` hook = `hook31.js`)

**`pg.js blur-continue`, playing, music solo, Master −12, id 41** (`bc-blur-continue-playing.txt`):
- past 28 → 28 ყველა ნაბიჯზე;
- slider `0`/`C` blur-ის შემდეგ და post-blur input-ებზე; შენახული pan-ი არ დაემატა;
- tat: music panner `-0.2,-0.5,-0.8` → revert `0` (τ 0.015) და post-blur-ზე **0** call;
- ახალი source start: 0;
- შემდეგ fresh drag (id 44) → +1 `Pan — მუსიკა`; real ArrowRight → +1.

**სხვა ნაბიჯები:**
- **pointercancel mid-drag** (`bc-cancel-key.txt`): entry არ იქმნება, tat-ი stored-ზე ბრუნდება. PASS.
- **id 42 suppression-ის დროს** (`bc-id42.txt`): 42 down + input 20 → draft, tat 0.4; up 42 → +1 entry (stored 0.4); up 41 → არაფერი. PASS.
- **Volume reference `vol-blur-continue`** (`bc-vol-blur-continue.txt`): past 28 → 29, ერთი `Volume` pointerup-ზე. R31-ის იდენტურია (74 → 75). PASS.

**Info (`bc-pid1-realclick.txt`):**
- real CDP mouse-ის `pointerId` = **1** (`isTrusted` true).
- synthetic id 1 down → blur, pointerup-ის გარეშე → focused Pan-ზე real `ArrowRight` **ჩუმად იგნორირდება** (A-R32-REVIEW-1, კონტრაქტის ფარგლებში).
- real click lane body-ზე (trusted pointerup id 1) suppression-ს ხსნის, მომდევნო ArrowRight → +1. ეს A-ის mitigation-ის მტკიცებულებაა real mouse-ზე. touch/pen არ შემიმოწმებია.
- refocus + keyboard-style input suppression-ის დროს იგნორირდება, release-ის შემდეგ +1 (`bc-cancel-key.txt`).

## R32-K

- Pan Home/End/←/←/→/PageDown: თითო +1. readout → `C` +1, შემდეგ disabled.
- Home focused Pan/Volume/Master-ზე: seek არ ხდება (pos 15 რჩება). native range Home value-ს min-ზე სვამს +1-ით (ინფორმაცია).
- Space focused Pan-სა და Volume-ზე play/stop-ს რთავს.
- Master → +1; Volume drag → +1 მხოლოდ release-ზე; Clip Gain 6+Enter → +1 `Clip Gain`.
- Delete/Backspace Clip Gain field-სა და library search-ში clip-ს არ შლის; search ტექსტი სწორად რედაქტირდება (`abc` → `a`).
- Pan drag playing-ის დროს: 0 start, tat მხოლოდ music-ზე (`-0.7,-0.8`, τ .015), +1. Undo playing-ის დროს: tat `-1` live, 0 start.
- Mute, Solo, fold/unfold და clip drag მუშაობს (`k-drag-misc.txt`).

## R32-S

- **`StudioWorkspace.tsx`** (2 hunk): `isRangeInputTarget` predicate (`isSliderTarget`-ის შემდეგ, უცვლელია) და early return non-modifier Delete/Backspace branch-ში `preventDefault`-მდე, gesture-blocked branch-ის შემდეგ.
- **`ArrangementLane.tsx`**:
  - ref `panBlurSuppressionCleanupRef`;
  - unmount effect;
  - `suppressPanPointerAfterBlur`;
  - pointerdown-ზე clear **წარმატებული** `beginTrackPanGesture`-ის შემდეგ (l.278–282 წავიკითხე);
  - `handlePanChange` early return;
  - `handlePanBlur` capture;
  - `handlePanKeyDown` და `onKeyDown` წაშლილია.
  - row 2, meter, fold და height არ შეცვლილა.
- doc 036: header + append.
- frozen ფაილები 375 OK. ახალი hex/`any`/`@ts-ignore`/`//` არ არის.

## R32-U — mutation table (scratch `c-round-32/mut`, 5 ფაილი: fader-guards, track-pan, delete-selection-ui, track-layout, gesture-guard; control 113/113)

| Mut | რა შევცვალე | შედეგი |
|---|---|---|
| a | guard-ის `if … return` წაშლა | killed: 7 (Volume/SFX/Master/Zoom/Pan fader-guards + **frozen track-pan Delete** + window-listener) |
| b | `isRangeInputTarget` → `isSliderTarget` | killed: playhead narrow-guard |
| c | `handlePanChange`-ის suppression return წაშლა | killed: 5 blur-continue |
| d | release listener `if (false)` | killed: pointercancel→key, another-pointer. **B-ის დასახელებული „fresh drag after release“ ტესტი გადარჩა**, რადგან ახალი pointerdown suppression-ს ისედაც ხსნის (info) |
| e | pointerdown-ზე clear-ის წაშლა | killed: id-42 |
| f | `flushPendingVolume()` წაშლა `beginTrackPanGesture`-ში | killed: pending Volume → Pan |
| g | Pan `onKeyDown` stopPropagation აღდგენა | killed: window-listener |
| b2 | override term → `trackPanValue(track)` | **survives**, მისაღებია (decision 4; A-ის enumeration-მა reachable path ვერ იპოვა) |

`r32u-summary.txt`-ის ბოლოს მიწერილი SyntaxError დამატებითი (h) mutation-ის script-ის შეცდომაა: (h) არ გაშვებულა და mutation-ის შედეგი არ არის. ყოველი run-ის შემდეგ restored=true, საბოლოო `diff -r` იდენტურია, node.exe 9 run-ის დროს. Red-first: A-ის `red-first.txt`-ში 9 fail / 8 pass ემთხვევა §4.4-ის პროგნოზს (Pan Delete snapshot-ზე მწვანეა, window-listener წითელი). ფაილი წავიკითხე; snapshot-ზე თავიდან არ გამიშვია.

## R32-Doc — PASS

ახალი სექცია ასახელებს `isRangeInputTarget`-ს, დაცულ ელემენტებს და `role="slider"`-ის გამორიცხვის მიზეზს, deviation 1-ის მოხსნას, suppression-ის წესს და დასრულების პირობებს, residual risk-ს (A-R32-REVIEW-1), enumeration-ს, ტესტებს და Ableton-ის შენიშვნას. კოდს ემთხვევა. **C-R32-01 doc-ში არ არის** (ახალია).

## Ableton — ორი ვერდიქტი (§4.5)

წყარო: `b-round-29/ableton-mixing-20261012.txt` (Live 12 Manual §18, https://www.ableton.com/en/live-manual/12/mixing/). „Delete“ მხოლოდ ერთხელ გვხვდება: „Tracks are deleted using the Edit menu's Delete command“. focused control-ზე კლავიშზე ან focus-ის დაკარგვაზე არაფერია. Double-click reset §18.1-ში დადასტურებულია.

| ქცევა | CZABA მოთხოვნა | Ableton |
|---|---|---|
| Delete focused fader-ზე timeline-ს არ ცვლის | PASS იზოლირებულად; **FAIL user flow-ში (C-R32-01)** | დაუდასტურებელი |
| Delete playhead/overview focus-ზე შლის | PASS (overview record) | დაუდასტურებელი |
| გაუქმებული drag (blur) შემდეგ არაფერს წერს | PASS | დაუდასტურებელი |
| Pan/Volume double-click reset | — (round 33) | დადასტურებული (§18.1); არ ეხება ამ რაუნდს |

## Gates

**G32-1:**
- tsc exit 0;
- fader-guards 19/19; frozen 10 ფაილი 206/206; სრული vitest **69 ფაილი 1212/1212** (1193 + 19), node.exe 7 (19 vitest-ის მერე, მალე 7);
- build ✓;
- Biome `./app`: 2 error, ორივე `format`: `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` (baseline CRLF, root). 218 warnings, 1 info. A-ის ფაილებში 0.

**G32-2:**
- HEAD `1cefea1` დასაწყისში და ბოლოს;
- `git status` 9 ხაზი (= §3.2);
- `b-round-31-tree-sha256` 375 OK (0 non-OK);
- protected 4/4 OK;
- owned ფაილების sha ბოლოს = დასაწყისს.

**G32-3:**
- header link (`Studio LabDemo`, visible) → `/studio-lab`: auth null, cookie '', workspace რენდერდება;
- session network-ში და header nav-ში `/api/studio-token`, `/api/recording-*`, `/api/download` და R2 host არ არის, მხოლოდ dev module `r2.config.ts` (allowed);
- media: `/middle-east.mp3`, `/videos/hero/hero-music.mp3` + `blob:` (C-ის upload);
- fetch/XHR hook key run-ისა და drag-ის დროს: 0 request, `Authorization` 0;
- GA `gcs=G100` (consent denied, known), `GET /api/cart` (known);
- `images.unsplash.com` ჩანს `network-anon-header.txt`-ში: ეს homepage-ის hero სურათია header nav-ამდე, workspace-ის კოდი არ არის. B-ის allowed სიაში არ იყო, ამიტომ ცალკე აღვნიშნავ;
- curl anonymous → 401; fake Bearer → **500** „Unable to prepare Studio access“, token-ის გარეშე (known root item);
- `/studio/middle-east` → „Sign in required“.

**C-R23-01:** `curl /studio-lab` 63 520 bytes, 2 NUL 28013/28014 (R31-ის იდენტური).

## Carried (უცვლელი, არა PASS)

- **C ბაგები:** C-R27-01, C-R6-02, C-R8-01, C-R23-01 (Tech Lead); C-R30-01 (polish).
- **Low:**
  - R26-M1;
  - MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2 (4b);
  - R9-REVIEWER-M1-L8 (4c);
  - DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, DOC034-UNREACHABLE-NOTE, DOC035-NOTES.
- **ახალი ღია საკითხი B-სთვის:** **A-R32-REVIEW-1** (suppression-ი რჩება ფანჯრის გარეთ release-ის შემდეგ; touch/pen). Mouse-ზე C-მ აჩვენა, რომ real click ხსნის. Contract-ის გადაწყვეტილება B-ისაა, C არ ხურავს.
- **Root items** (`root-pre-push-review.md` / `publication-checkpoint.json` / b-round-31 §7):
  - SRW-21 middle-east hardcode;
  - Lenis `/studio/*`-ზე;
  - portable instruction paths;
  - export hard-clip 0 dBFS;
  - second-remote reconcile;
  - auth-ის CRLF Biome error-ები;
  - `frontend-architect.md` Write/Bash grant;
  - `Modal.tsx` focus gap;
  - GA scroll consent-denied;
  - fake Bearer 500;
  - CDP allowlist;
  - `Content-Type` charset;
  - dev server availability.
- **Commit readiness:**
  - round 31-ის 7 ფაილი C-მ round 31-ში დაადასტურა.
  - round 32-ის ცვლილებები **commit-ისთვის მზად არ არის**, სანამ B C-R32-01-ზე არ გადაწყვეტს. Guard-ი fader-ის კლავიშს სწორად ბლოკავს, მაგრამ user flow-ში Delete-ს თიშავს.
- **Tech Lead:**
  - R31-T: real Chrome-ში range-ის `input` blur-ის შემდეგ დაჭერილ ღილაკზე. ჯერ არ შემოწმებულა; C-მ მხოლოდ trusted pointerup id 1-ის clear დაადასტურა;
  - TL-Q-FB05-FB11.

## B-სთვის შემდეგი ნაბიჯი

1. C-R32-01 (Medium) round 33-ში (4b) ან ცალკე bug round-ში. ტესტი: real-ish თანმიმდევრობა — fader focus → clip header pointerdown/up → Delete → წაშლა.
2. A-R32-REVIEW-1-ის კონტრაქტი.
3. (d)-ის კომენტარი: „fresh drag after release“ ტესტი pointerup-ის clear-ს არ იცავს; მას იცავს pointercancel/another-pointer ტესტი.
