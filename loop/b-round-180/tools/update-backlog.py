import json

P = 'backlog.json'
b = json.load(open(P))
ADD = '2026-10-26 B round 180 -> 181 planning (D-29z146)'
b['updated'] = '2026-10-26 (B round 180 -> 181 planning, D-29z146)'
b['current_task'] = (
    "current-task.md (round 181: D-29z146 - M1 round icon-only Play: Transport Play/Pause button w-24 + label -> w-8 h-8 rounded-full px-0, "
    "icon only (lucide Play/Pause size-4), aria-label Play/Pause from studioPlaybackStrings, title 'Play (Space)'/'Pause (Space)'; "
    "neighbours Back to start..Loop shift x -64 px, right navigation group, rows and everything below unchanged (B probe b-round-180/out/transport-probe.json); "
    "baseline HEAD 59d4bab (gate 180 published), tree = c-round-180/end-tree-sha256.txt 1005; grants b-round-180-r181-grants.txt (6), new 1 (doc 149), frozen 999; "
    "vitest base b-round-180-r181-vitest-base.txt 15 files 229/229; mutations m299-m303)"
)
b['advisor_used_by_B'] = (
    "2026-10-26 round 180 -> 181 planning: advisor available and consulted after orientation (before writing) and at the end; advice followed: "
    "sha256sum -c of c-round-180 end tree on HEAD 59d4bab (OK, 1005); decision files re-hashed (unchanged); regression computation stated (2 days, not due; round 182 expected REGRESSION); "
    "fresh bounded frontend-architect request b-round-180-checkpoint-request.md (supersedes b-round-173); B rulings on round-180 info items recorded; "
    "M1: no new test file (TS1/TS2 edited), merged token set specified, title with Space hint vetoable, B layout probe as C's expected values, Ableton Live 12 manual 6.3 cited with icon-only kept as inference"
)
of = b['open_findings']


def find(i):
    for f in of:
        if isinstance(f, dict) and f.get('id') == i:
            return f
    raise SystemExit('missing ' + i)


pub = 'closed 2026-10-26: C round 180 PASS (c-round-180.json browserVerified=true realVerified=true, 0 bugs); round 180 published 59d4bab (gates/gate-round-180.json)'
for i in ['B-R174-ACCENT-EQ-BRAND', 'C-R179-DOC147-STALE']:
    f = find(i)
    f['status'] = pub + ' | was: ' + f['status']
    f['closed'] = ADD
for i in ['ARCH-R178-SIGNAL3', 'ARCH-R179-SIGNAL3']:
    f = find(i)
    f['status'] = f['status'] + ' | round 181 planning: carried into the fresh bounded request b-round-180-checkpoint-request.md (DUX-R-5 boundary)'
of += [
    {"id": "ARCH-R180-SIGNAL3", "severity": "info", "status": "architecture signal, not scheduled: three ~400-char button class strings (Lane l.723/l.731, LibraryPreview l.332) edited every colour round; ~80-line fake AudioContext/ResizeObserver setup duplicated again (drag-feedback-colour-ui l.30-107); reviewer verdict keep for now; seventh consecutive Signal 3 (174-180); in b-round-180-checkpoint-request.md Q1/Q2", "evidence": "a-round-180.md Architecture note (verbatim)", "added": ADD},
    {"id": "A-R180-N1-STRUCT-LOOKUPS", "severity": "info", "status": "B ruling (vetoable): accepted. Rule clarified for later tasks: no colour-class selectors; structural navigation (parentElement, aria-controls -> getElementById, firstElementChild) from an element found by role/name/text/testid is allowed when every hop throws a labelled Error", "evidence": "c-round-180.json info[0]; a-round-180.md code review Low 2", "added": ADD},
    {"id": "B-R180-M296-EXPECTATION", "severity": "info", "status": "B error in round-180 section 4.1: m296 expected lane-strings-ui green, but LSU7 l.552 already locks the compact import via importIncludes; the extra reds (m291/m294 DXG7, m296 LSU7) are stricter than planned and accepted; no action", "evidence": "c-round-180.md MUT-180; a-round-180.md mutations", "added": ADD},
    {"id": "C-R180-K8-PLAYHEAD-MASK", "severity": "info", "status": "B ruling (vetoable): accepted for round 180 - the masked pixels are the playhead line itself (K8, a K-table element) crossing the lane, not drag feedback; one re-scan with the playhead moved to ~10 s is added to the next REGRESSION round (REG-DUX5-PLAYHEAD-RESCAN) instead of reopening DUX-R-5", "evidence": "c-round-180.json info[5]; c-round-180/out/masks-detail.txt", "added": ADD},
    {"id": "C-R180-BLOCKED-MOVE-ONE-GHOST", "severity": "info", "status": "info only: a purely vertical Music->Video drag in the real browser renders 1 blocked ghost (no kept valid ghost; jsdom showed 2 after crossing a valid lane); behaviour unchanged; C inference unverified, not scheduled", "evidence": "c-round-180.json info[2]", "added": ADD},
    {"id": "A-R180-N1-SHELL-WRITE", "severity": "info", "status": "process note: two N1 debug/fix passes used a python string-replace instead of Edit; final N1 content edited with Edit and fully re-verified by A and C (T180-TARGETED 249/249); no action", "evidence": "a-round-180.md process notes", "added": ADD},
    {"id": "C-R180-HEAD-COPY-VITE-CACHE", "severity": "info", "status": "process note: C's /tmp HEAD copy symlinked store/node_modules and its vite server re-optimised the shared node_modules/.vite cache; tracked tree unchanged (start == end hash), :5173 stayed 200; later HEAD copies should not share the .vite cache (vite --force with a separate cacheDir) or should re-use a recorded HEAD measurement", "evidence": "c-round-180.json info[6]", "added": ADD},
    {"id": "A-R180-DOC147-L123", "severity": "info", "status": "scheduled round 181 D1 (strike the stale doc-147 TODO 'C round 178 evidence; then Completed'; code-reviewer Low 7)", "evidence": "a-round-180.md code review Low 7", "added": ADD},
]
for r in b['rounds']:
    if r.get('round') == 180:
        r['status'] = 'C PASS (c-round-180.json browserVerified=true realVerified=true, 0 bugs; G180-3 fake-Bearer 403 BLOCKED backend); published 59d4bab (gate 180)'
b['rounds'].append({
    "round": 181, "task": "current-task.md", "decision": "D-29z146", "status": "dispatched",
    "items": ["M1 round icon-only Play (Transport)", "A-R180-DOC147-L123 (doc 147 TODO)", "doc 148 Completed"],
    "note": "baseline HEAD 59d4bab (gate 180 published, clean tree); tree = c-round-180/end-tree-sha256.txt (1005, sha256sum -c OK); grants b-round-180-r181-grants.txt (6); new b-round-180-r181-new-files.txt (1); frozen 999 (b-round-180-r181-tree-sha256.txt); start copies b-round-180/r181-granted-start/; vitest base 15 files 229/229 (b-round-180/out/vitest-base-r181.json)",
    "added": ADD})
q = b['post_current_stage_queue']
v = [e for e in q if e['id'] == 'VISUAL-A-OBSIDIAN'][0]
v['status'] = v['status'] + (
    " | round 181 planning (D-29z146): DUX-R-5b-3b done (round 180 C PASS browserVerified=true realVerified=true, INVENTORY-EXIT 0 unmapped, published 59d4bab) -> "
    "DUX-R-5 done (5a, 5b-1, 5b-2a, 5b-2b, 5b-3a, 5b-3b all C PASS); B-R174-ACCENT-EQ-BRAND closed; regression not due (regression-last 2026-10-24, 2 days); "
    "M1 = round 181; fresh bounded frontend-architect request b-round-180-checkpoint-request.md (fallback (c), non-blocking); next planning on/after 2026-10-27 = REGRESSION; then M3, M4, ROOT-RECON-GRID-HARNESS")
for i, o in enumerate(v['order']):
    if o.startswith('DUX-R-5 one colour rule'):
        v['order'][i] = o + ' | D-29z146: 5b-3b done (round 180, 59d4bab); DUX-R-5 DONE'
    if o.startswith('M1 round icon-only Play'):
        v['order'][i] = o + ' | D-29z146: round 181'
v['m1_plan_d29z146'] = {
    "round": 181,
    "user_authority": "visual-direction-a.md M1 (Play: icon only instead of the 'Play' text, round button; 'the button narrows, neighbours move'); approved 2026-10-21 (approved_moves.M1)",
    "edits": {
        "P1": "ArrangementTransport.tsx Play cn extra 'w-24 justify-center bg-foreground font-medium text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88' -> 'w-8 justify-center rounded-full px-0 bg-foreground text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88' (merged: h-8 w-8 rounded-full px-0; no w-24/rounded-md/px-2.5)",
        "P2": "remove <span>Play</span> and <span>Pause</span>; lucide Play/Pause size-4 shrink-0 strokeWidth 1.5 aria-hidden unchanged",
        "P3": "aria-label studioPlaybackStrings.playLabel 'Play' / pauseLabel 'Pause' (same text); title playTitle 'Play (Space)' / pauseTitle 'Pause (Space)'",
        "S1": "strings.ts studioPlaybackStrings + playLabel, pauseLabel, playTitle, pauseTitle",
        "S2": "strings.test.ts EXPECTED_V02B_PLAIN_STRINGS.studioPlaybackStrings + the 4 entries",
        "T1": "transport-surface-ui TS1 Play rounded-full (not rounded-md), other 11 rounded-md; TS2 w-8/h-8/rounded-full/px-0, no w-24/rounded-md/px-2.5, textContent '', title, 1 svg",
        "D1": "doc 147 strike l.123 stale TODO", "D2": "doc 148 status Completed (C round 180 PASS, 59d4bab)", "D3": "new doc 149"},
    "rulings": {
        "R38": "title with the Space hint: the visible label is gone, so a tooltip keeps the action and its shortcut discoverable (Back to start already has a title); vetoable",
        "R39": "accessible name unchanged ('Play'/'Pause', not 'Play (Space)') so screen readers and every existing suite keep the same name; vetoable",
        "R40": "size 32x32 = the existing h-8 row height; icon stays 16 px (spec); no new token; vetoable"},
    "probe": "b-round-180/out/transport-probe.json (B in-page simulation, not evidence): Play 12,43 96x32 -> 32x32; Back to start..Loop x -64; right group 925.8/765.8 unchanged; row h 49/87, lines 2/3, next row y 84/122 unchanged",
    "mutations": "m299-m303",
    "c_rows": "T181-TARGETED, SCOPE-181, AN-REVIEW-181, MUT-181, CC-M1, LAYOUT-M1, RV1-M1, CONTRAST-M1, FOCUS-M1, NO-BRASS-M1, BEHAVIOUR-M1, A11Y-M1, G181-3, PX-NET/REG-HYD",
    "ableton": "Live 12 manual 6.3 Transport and Playback (https://www.ableton.com/en/live-manual/12/arrangement-view/, fetched 2026-10-26): separate Play and Stop buttons in the Control Bar; space bar toggles playback (confirmed text). Icon-only look = inference from the figure (not viewed). Round shape = CZABA M1 decision; single Play/Pause toggle vs Play+Stop = existing deliberate difference",
    "user_vetoable": True, "added": ADD}
for a in v['acceptance']:
    if a.get('id') == 'RV-1':
        a['status'] = a['status'] + ' | M1 (round 181, D-29z146): approved exception bounded to the transport row: Play 96->32 px wide, Back to start..Loop x -64 px; right group, row heights and everything below 0 px'
reg = b['regression_rounds']
reg.append({
    "id": "REGRESSION-ROUND-2026-10-27", "round": "expected 182 (first planning on/after 2026-10-27)", "decision": "pending", "status": "planned",
    "trigger": "speed rules 2026-10-21: regression-last.json 2026-10-24 round 122; due on/after 2026-10-27",
    "scope_additions": ["every done/c_pass item one short check at 1440x900 and 1280x720", "npm run test:e2e:smoke", "C-R167-METRONOME-UNDER-MUTE evidence gap", "REG-DUX5-PLAYHEAD-RESCAN (C-R180-K8-PLAYHEAD-MASK: NO-BRASS re-scan of ring/hint boxes with the playhead moved to ~10 s)", "DUX-R-5 one short whole-Studio R-B>=45 check outside K7-K12", "M1 (if round 181 C PASS)"],
    "added": ADD})
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok', len(of))
