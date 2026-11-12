# C round 480 — RETRO 480 verification: PASS (0 bugs)

HEAD `bbb3193`, clean tree at start and end; r480 manifest (1,391) and protected manifest rc 0 both times. `browserVerified` true. Evidence in `c-round-480/` (scripts in `scripts/`, data in `data/`, PNGs, `rows23.json`, `claims.txt`).

| # | Row | Result |
|---|---|---|
| 1, 13 | SOURCE-SCOPE | 0 status lines, both manifests rc 0, at start and end. `l57-check` rc 0 |
| 2 | G480-AUTH (browser, 1440×900 and 1280×720, new context, warmed) | `/studio-lab`: `auth_user` null, timeline visible, "Demo collection ready". `/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 workspace. `GET /api/studio-token…` no Authorization: **401** `{"error":"Please sign in to access Studio."}`. Fake-bearer path BLOCKED (backend unavailable in cloud) |
| 3 | STUDIO-SMOKE-480 (browser, both) | Enter on the first library item: clips 0→1; Play ~1.5 s: 00:00.000 → 00:01.462 (1440) / 00:01.471 (1280); after Stop 00:01.622 / 00:01.572, unchanged 0.8 s later (stopped). Export dialog opened, Esc closed it (0 dialogs). 0 page errors |
| 4 | RT-SCREEN (browser; mock API started and stopped by PID) | Line counts 138/168/118/144, outside 97/124/86/101 — equal to B's, delta 0, and the text sets are identical. Journey: clips at left 512/1152/1792, status "“Night Pulse · Melody” added to the Stems track at 00:48.000 (nearest free spot)". SR-480-1: Store CZABA span `rgb(201,164,106)` (brass) vs Studio exit link `rgb(236,230,218)`. SR-480-3: status span border-top 1px solid, radius 6px. SR-480-2: play button sits over the cover's "CZABA AUDIO BUNDLE" mark (journey-1 PNG) |
| 5 | CLAIMS | `claims.txt` identical to B's planning output; 0 MISSING; stderr empty |
| 6 | RT-NUM | B's 12 scripts re-run into `c-round-480/data`: every output `cmp`-identical to B's (incl. L57/L58 loops). Totals $214.36, B $133.40 / A $68.69 / C $12.27, 62.2 %, median $15.29, B median 9.38, FAIL rounds $60.45, stage sums, STOPs 466/471/472/475/476, 43 deferred, gate reviews 35 items, "24 %" = 1 − 214.36/282.31 = 24.07 % (retro 465 §1/§2: $282.31, $20.25, 71.7 %) |
| 7 | RT-CAUSE | Spot-checked §3: the five STOP rounds' `a-round-N.md` l.3 match the retro's causes (466 TS8 pre-check, 471 FN4, 472 doc 306 l.79 grant, 475 §1.2 vs §1.6, 476 R1 SpotlightLoader). Opinions labelled `tech-lead`/`product-designer`. No invented cause found |
| 8 | RT-IDS | `retro_runs` 480, `next_due` round 495, backlog v469, last D-ID D-29z1707; RETRO480-* and RC-R47x all `ruled (D-29z1706)`; SINGLE-RUNNER "still 1x"; FIREFOX-CHECKS `open_root`, SAFARI-CHECKS/HIREUS-EMAIL-CLIENTS `open_tech_lead_manual`, each with its TLM ids; K24 all found |
| 9 | RT-LESSONS | 60 lines, 57,487 B; hunks 3,15-16,18,24,28,40-41,58 = K18; `diff` equals `lessons-diff.txt`. Only finding id lost: D-29z1639. Note: l.16 also dropped test-row labels DW3/DW9/DW10 (not finding ids; C-R282-01/03 kept) |
| 10 | RT-CHECKERS | L57 OK 10/15 (INCOMPLETE 469, 470, 472, 475, 477); L58 OK 13/14 (471 INCOMPLETE); `l58-check current-task.md` rc 0; files cmp-equal |
| 11 | RT-SABA | Questions Q1–Q7 each carry a default; Q2 says LeadMagnet is on the keep-list, behaviour unchanged; Q3 (FIREFOX-CHECKS, blocked on root) and Q4 (SAFARI-CHECKS, HIREUS-EMAIL-CLIENTS, blocked on Saba/Brevo) name the task and blocker; §12 frames rule changes as proposals |
| 12 | RT-PRIMITIVES | K26/K32/K33 inside `claims.txt`, equal to B's. Not independently re-opened hit by hit beyond that |

Not run: gate-owned verify/full tests (root). Backend-blocked: fake-bearer premium path.
