import json, sys
P = sys.argv[1]
b = json.load(open(P))
TAG = "2026-10-27 B round 205 -> 206 planning (D-29z171)"
QTAG = "2026-10-27 B round 205 -> 206 planning (D-29z172, Saba 2026-10-27 queue move)"
def restat(f, new):
    f["status"] = f"{new} | {TAG} | was: {f.get('status','')}"
OF = {f["id"]: f for f in b["open_findings"]}
DL = {f["id"]: f for f in b["deferred_low_polish"]}
PUB = "published c274930 (gate 205; rounds 204+205)"
for i in ["B-R203-LEADMAGNET-AUTO-OPEN-FOCUS", "B-R204-SCROLLLOCK-POSITION-LOST"]:
    restat(OF[i], f"done: C round 205 PASS browserVerified=true realVerified=true (c-round-205.json rows LM-OPEN/LM-TAB/LM-STEPS/LM-CLOSE/LM-EXIT/SCROLL-LOCK PASS at 1280/1440/375); {PUB}")
for i in ["C-R202-04", "C-R202-05", "B-R201-HEADER-USERMENU-KEYBOARD"]:
    restat(OF[i], f"done: C round 204 PASS browserVerified=true realVerified=true; gate blocker GATE204-B1 fixed and C-verified in round 205 (HF6B-205, AN-REVIEW-205); {PUB}")
restat(OF["GATE204-B1"], f"closed: HF6b exists and is red-proven by m11 (c-round-205.md HF6B-205, T-RUN-205); doc 161 l.111 names HF6b (AN-REVIEW-205); {PUB}")
b["open_findings"].append({
    "id": "SABA-B-5", "severity": "medium",
    "title": "Fader drag is slow (Saba 2026-10-27): every pointer move of a track/group volume, master or clip-gain fader re-renders the whole Studio",
    "facts_source": "store c274930: ArrangementContext.tsx previewVolumeTarget l.2365-2400 (track+group), previewMasterGain l.2727-2745, previewClipGainFader l.2846-2872, previewClipGainMembers l.2892+: each calls updateHistory (setHistory -> whole context value) + syncPlayback(next) per move. previewTrackPan l.2700-2707 writes panOverrideRef + handle.setTrackPan only (no React state). scheduleKey l.533 = JSON.stringify(clips, loop) without gainDb, so a fader move does not call startGraph; it does stringify all clips and write every track gain/pan per move while playing (l.1056-1100).",
    "facts_measured": "B probe on a scratch prod build of c274930 (b-round-205/tools/perfprobe.cjs, out/perfprobe-head-*.json, 1440x900): track volume drag 121 moves -> 91 commits x 83 components (median); master 96 x 80; pan 107 commits x 4 (median); 0 source start() calls during any drag while playing; at 1x CPU frame p95 16.8 ms for all; at 6x CPU throttle while playing frame p95 50 ms (volume, master) vs 33.4 ms (pan) and 53/96 frames > 33 ms (volume/master) vs 31 (pan). Group and clip-gain faders not probed by B (A's harness covers them).",
    "hypothesis_rejected": "root's 'syncPlayback rebuilds the graph per move' is not supported by source (scheduleKey excludes tracks/master/gainDb) nor by the probe (0 restarts); kept as an asserted harness row (0 restarts while playing).",
    "plan": "PERF-1a (round 206) measures it (fader scenarios x stopped/playing, record mode); PERF-FADER (first PERF task after PERF-1) fixes it following the pan pattern; budgets <=3 committed components per move, 0 restarts, export of a dragged mix bit-identical to typed values",
    "origin": "Saba (user report) + root code fact", "status": "open: scheduled (measured in round 206 PERF-1a, fixed in PERF-FADER)", "added": TAG})
b["open_findings"].append({
    "id": "GATE205-DOC162-STATUS", "severity": "low",
    "title": "Doc 162 l.4 still says it waits for C's round-205 browser check; published stale in c274930 (GATE204-B1 class)",
    "evidence": "c-round-205.json notes.doc162StatusLine; store c274930 docs/implementation/2026/quarter-IV/162-lead-magnet-dialog-focus.md l.4",
    "origin": "C (round 205 note)", "status": "dispatched round 206 (D-29z171, R112: one-line status fix, granted)", "added": TAG})
b["deferred_low_polish"] += [
    {"id": "C-R205-01", "severity": "low", "title": "LeadMagnet in-flight submit: disabled input/CONTINUE drop focus to BODY; Tab reaches header links behind the modal; Escape does nothing until the request ends",
     "evidence": "c-round-205/out/steps/inflight-1280.json; a-round-205.md section 9; gates/round-205/review.md Suggestion 4",
     "repro": "node c-round-205/tools/inflight.cjs 5173 1280 (/api/subscribe -> 500 after 4 s): popup -> Tab -> Enter -> email -> Enter -> Tab, Tab, Escape",
     "fix": "reviewer S4: focus the dialog container (preventScroll) before the controls become disabled; Escape handled on the container while submitting",
     "ruling": "B rates Low (C's primary rating): window = network time, A-1 re-anchors focus after the response, data safe; differs from the reviewer's Medium on the post-error sibling because that sibling (permanent loss) is already fixed by A-1. Scheduled, not buried: fixed by the next round that owns LeadMagnetPopup.tsx or by the useDialogFocus task (ARCH signal round 205), whichever comes first.",
     "status": "deferred_low_polish (scheduled with the next LeadMagnetPopup owner)", "added": TAG},
    {"id": "C-R205-02", "severity": "low", "title": "Store header (position: sticky) scrolls away: at scrollY 800 the header box is at y -800 (tree = ref, pre-existing)",
     "evidence": "c-round-205/tools/hdr.cjs, tools/amdebug.cjs", "repro": "/store at 1280x720, scroll to 800, read header getBoundingClientRect().top",
     "fix": "find the ancestor that defeats sticky (overflow on a wrapper or the Lenis wrapper); fits STORE-2b header work", "status": "deferred_low_polish (candidate for STORE-2b/STORE-3 owner)", "added": TAG},
    {"id": "GATE205-S1-NESTED-SCROLL-LOCK", "severity": "low", "title": "Two scroll locks at once (LeadMagnet exit-intent over AuthModal): second lock reads scrollY 0 and overwrites top; its unlock unfixes the body while AuthModal is open (same as C round-205 Info #8)",
     "evidence": "gates/round-205/review.md Suggestion 1; c-round-205.md For B (Info #8)", "fix": "module-level lock counter in useScrollLock, or guard in useLeadMagnet against opening while a modal is open", "status": "deferred_low_polish (fold into the useDialogFocus task if approved)", "added": TAG},
    {"id": "GATE205-S3-TRAP-SELECTOR", "severity": "low", "title": "LeadMagnet focus trap queries only button,input; a future link inside the dialog would escape the trap",
     "evidence": "gates/round-205/review.md Suggestion 3 (LeadMagnetPopup.tsx:78)", "fix": "standard tabbable selector", "status": "deferred_low_polish (with C-R205-01)", "added": TAG},
    {"id": "GATE205-S7-MENU-HISTORY-NAV", "severity": "low", "title": "Header user menu stays open after browser back/forward (no close on location.pathname change)",
     "evidence": "gates/round-205/review.md Suggestion 7", "fix": "effect on location.pathname -> setIsUserMenuOpen(false)", "status": "deferred_low_polish (Header owner; see ARCH signal round 204 HeaderUserMenu)", "added": TAG},
    {"id": "GATE205-S8-S9-NITS", "severity": "info", "title": "Nits: Header re-renders non-memoized CommandPalette on menu toggle (click only); focusedStepRef typed string|null instead of the step union",
     "evidence": "gates/round-205/review.md Suggestions 8, 9", "fix": "only when the owners change again", "status": "deferred_low_polish (info-level)", "added": TAG},
]
DL["C-R204-02"]["note_d29z171"] = "gate 205 Suggestion 2 refines it: in desktop Safari a mouse click on the open menu button blurs with relatedTarget null -> close, then the click reopens it (flicker). Fix: do not close on a null target (outside-pointerdown listener covers mouse). Header frozen until its next owner; HF4 tests the null case and must change with it."
DL["GATE204-S3"]["note_d29z171"] = "gate 205 Suggestion 5 repeats it (StudioShowcase CTA: no reduced-motion variant; transition list overridden by app.css:307)."
DL["B-R203-USERMENU-HOVER-ESCAPE"]["note_d29z171"] = "gate 205 Suggestion 6 repeats it (WCAG 1.4.13)."
DL["GATE204-S4"]["status"] = f"deferred_low_polish (A did not apply the optional R108(2) in round 205, a-round-205.md section 2) | {TAG} | was: {DL['GATE204-S4']['status']}"
DL["shared-modal-no-focus-management"]["note_d29z171"] = "gate 205 Architecture note proposes one bounded useDialogFocus hook (initial focus, Tab trap, Escape, focus return) for LeadMagnetPopup, AuthModal and ui/Modal, plus the useScrollLock lock counter; acceptance LM1-LM9 unchanged + equivalent AuthModal/Modal tests. Recorded as architecture signal (round 205), not scheduled."
b["architecture_signals"].append({"round": 205,
    "signal": "Repeated region / shared gap: LeadMagnetPopup.tsx carries 4 effects and 7 refs of dialog focus handling; ui/Modal and AuthModal lack the same (shared-modal-no-focus-management). Header Signal 4 (menu state/listener/auth-sync) - reviewer: keep.",
    "proposal": "gate-205 reviewer: one bounded task creating useDialogFocus for exactly LeadMagnetPopup, AuthModal, ui/Modal + useScrollLock lock counter; closes C-R205-01, GATE205-S1, GATE205-S3 and the open half of shared-modal-no-focus-management; LM1-LM9 unchanged; no visible markup change on the keep-list popup",
    "status": "signal_recorded_not_scheduled (store-side; queued thinking: before STORE-2b touches overlays, after STUDIO-PERFORMANCE per Saba's 2026-10-27 order)", "added": TAG})
r = b["leadmagnet_dialog_rulings_d29z170"]
r["DEVIATION_A1_ruling_d29z171"] = "accepted: the wasSubmittingRef effect re-anchors focus on the email input after a failed submit; C verified it in the browser (c-round-205/out/steps/fail-tree-1280.json) and m13 red-proves it. Residual in-flight window = C-R205-01 (Low, scheduled)."
# queue move (Saba 2026-10-27)
q = b["post_current_stage_queue"]
ids = [e["id"] for e in q]
perf = q.pop(ids.index("STUDIO-PERFORMANCE"))
ids = [e["id"] for e in q]
q.insert(ids.index("STORE-REDESIGN"), perf)
perf["status"] = f"in_progress: PERF-1a dispatched round 206 (D-29z171) | {QTAG} | was: {perf['status']}"
perf["queue_move_d29z172"] = "Saba 2026-10-27: STUDIO-PERFORMANCE moves ahead of SYS-1..3, the remaining STORE-REDESIGN stages (2b..5), REVIEW-RECOMMENDATIONS and T12-ADVANCED; order after it: SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, then the rest unchanged. Literal reading: all PERF tasks (16 in perf-plan, ~25 rounds) before SYS-1..3; question for Saba recorded in b-round-205.md section 8 (no wait)."
perf["prerequisites"] = ["SABA-B-4 rounds 204 and 205 published (c274930)"]
perf["stages"] = [
    {"id": "PERF-1a", "what": "harness infra (perf/ testDir, playwright.perf.config.ts, test:perf, budgets JSON assert|record, median of 3) + load, playback and fader scenarios (track, group, master, pan, clip gain x stopped/playing)", "status": "dispatched round 206 (D-29z171)"},
    {"id": "PERF-1b", "what": "remaining baseline scenarios: zoom keydown with 30 clips, clip click, range drag, play/pause commit size, WAV export long tasks and peak memory, JS bytes per route, DOM per clip, backing-store MB", "status": "not_started (next after PERF-1a C PASS)"},
    {"id": "PERF-FADER", "what": "SABA-B-5 fix: fader/gain gestures write the audio param directly (pan pattern), one history entry on commit; budgets <=3 committed components per move, 0 restarts, dragged-mix export bit-identical to typed values; undo/Esc/keyboard/Shift fine/double-click/readouts unchanged", "status": "not_started (first PERF task after PERF-1; B may run it before PERF-1b if PERF-1a already gives its rows - decide at round-207 planning)"},
] + [{"id": f"PERF-{n}", "what": "see perf-plan.md task outline", "status": "not_started"} for n in range(2, 17)]
sr = [e for e in q if e["id"] == "STORE-REDESIGN"][0]
sr["status"] = f"paused (D-29z172: Saba 2026-10-27, STUDIO-PERFORMANCE first; keeps its status and RETRO-at-end rule) | {sr['status']}"
for s in b["systemic_tasks"]:
    s["order_d29z172"] = "after STUDIO-PERFORMANCE, before the remaining STORE-REDESIGN stages (Saba 2026-10-27)"
# rounds
last = b["rounds"][-1]
if last.get("round") == 205:
    last["status"] = "c_pass_published: C round 205 PASS browserVerified=true realVerified=true (12 rows, 2 Low); gate 205 published c274930 together with round 204"
b["rounds"].append({"round": 206, "task": "current-task.md", "decision": "D-29z171", "status": "dispatched",
    "type": "FEATURE STAGE (STUDIO-PERFORMANCE PERF-1a: perf harness + SABA-B-5 fader measurement) + one-line doc fix",
    "items": ["R111 PERF-1a harness (perf/, playwright.perf.config.ts, test:perf, budgets, load/playback/fader scenarios)", "R112 GATE205-DOC162-STATUS doc 162 l.4"],
    "note": "baseline HEAD c274930 (gate 205 published); all of app/ frozen; new files under perf/ + playwright.perf.config.ts + doc 163; grants package.json (one script) and doc 162 l.4",
    "next": "PERF-FADER or PERF-1b (decided at round-207 planning); regression due on/after 2026-10-30", "added": TAG})
b["current_task"] = "round 206: R111 STUDIO-PERFORMANCE PERF-1a perf harness with fader scenarios (SABA-B-5 measurement), R112 doc 162 status line (D-29z171)"
b["architecture_checkpoint_requests"].append({"id": "ARCH-CHECKPOINT-STUDIO-PERFORMANCE", "file": "b-round-205-checkpoint-request.md", "status": "requested_non_blocking",
    "boundary": "STUDIO-PERFORMANCE opens (feature boundary); ArrangementContext.tsx 3832 lines is the owner PERF-FADER, PERF-8 and PERF-10 all change", "added": TAG})
b["advisor_used_by_B"] = "2026-10-27 round 205 -> 206 planning: advisor available and consulted after orientation (before writing) and at the end; advice followed: PERF-1 split 1a/1b, all of app/ frozen, hook stub + start() counter proven on a scratch prod build before dispatch, C-R205-01 ruled Low but scheduled, doc 162 status fix granted, queue move recorded with a D-ID | previous: " + str(b["advisor_used_by_B"])[:300]
b["updated"] = TAG
json.dump(b, open(P, "w"), indent=1, ensure_ascii=False)
print("ok")
