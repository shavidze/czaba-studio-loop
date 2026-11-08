# B round 402 -> 403 planning: backlog v370 -> v371. Not re-runnable (writes update-backlog.done).
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-402/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 370, b['version']
BY = '2026-11-08 B round 402 -> 403 planning'
def node(idv):
    hits = []
    def w(o):
        if isinstance(o, dict):
            if o.get('id') == idv: hits.append(o)
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(b); return hits
def one(idv):
    h = node(idv); assert len(h) == 1, (idv, len(h)); return h[0]
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')

decisions = [
 ('D-29z1382', "Round 402 (PERF-14b-ii) accepted on independent C evidence: c-round-402.json taskStatus PASS, 14/14 rows PASS, 0 bugs, browserVerified/realVerified true (AUTH, VIRT-FRAMES, PIN-BLUR-GROUP, STUDIO-SMOKE at 1440x900 and 1280x720); gate 402 published 7d7d7b2 on both remotes (verify 261 files / 3862 tests, review COMMIT OK). PERF-14b-ii done. RETRO 401 done (RT-FIX-401 PASS). Closed: C-R401-01, TL-R398-SK-M1, Q-14B-PIN-GROUP-MEMBERS, A-R400-REVIEW-SPEC-LOWS (Lows 1, 2, 4; Low 3 stays deferred as A-R400-REVIEW-SPEC-L3). A-R402-REVIEW-F4 closed not_applicable (C: clips have no tab stop, c-round-402/f4-1440x900.json). Round-402 Lows A-R402-REVIEW-F1 residual/F2/F3/F5/F8 and GATE402-L1..L3 -> deferred_low_polish. A's pin-tracking architecture note -> architecture_signals (A-R402-ARCH-PIN-TRACKING), not scheduled."),
 ('D-29z1383', "PERF-14c premise re-measured (L37) on a HEAD 7d7d7b2 production build, 200 clips (b-round-402/probe/head-minzoom-*.json): 1x zoom keys <= 24 ms at default and near-min zoom (plan target 'zoom p95 < 50 ms' met at 1x); 6x default 40-64 ms (1-2 clips mounted, 2534-4096 columns), near-min 48-88 ms (16-24 clips mounted alternating per key, 159 columns). performance-optimizer consult (b-round-402/consult-perf-14c-ii.md): near-min cost is mount churn, not peak building; measure column-cap and fixed-path mutants + CPU profile before 14c-ii. PERF-14c split: 14c-i peaks-client hardening (the 8 round-315 Lows) + min-zoom harness record rows (round 403); 14c-ii pyramid (max-only exact range-max, lazy levels, sourcePeaks type unchanged; or mount-churn/hysteresis first if the measurement says so); 14c-iii canvas tiles. PERF-14 now has 6 stages (docs 254-256 keep 'of 4' on l.4 until the final stage rewrites them, L28). The oss-adoption wording 'min/max' vs a max-only pyramid is an internal data choice to rule at the 14c-ii planning (no user-visible behaviour)."),
 ('D-29z1384', "Round 403 = PERF-14c-i from b-round-402/sketch-403.patch.txt (sha256 5cc6d634, 4 files: peaks.client.ts, peaks-worker.test.ts, studio-lab-scale.perf.spec.ts, budgets.scale.json), applied byte-for-byte. Evidence on the final sketch: mutants 8/8 red (b-round-402/mutants/summary.txt), full vitest 261 files / 3870 tests, tsc/lint/biome rc 0, scale spec alone rc 0 (23 HEAD rows' deterministic samples equal c-round-402; new rows 121.1/121.1, 1/1), browser fallback probe normal/none/failing at both viewports on HEAD and sketch builds. tech-lead pass 1 on v1 ad417ff7 (TL-R402-SK-M1..M3, L1..L5) disposed; delta pass 2 'no new Medium+' (b-round-402/sketch-review.md)."),
 ('D-29z1385', "Rulings in the 14c-i patch: MU-403-REPLIED-ON-GARBAGE is live (tech-lead: pre-aborted request) and killed by PW24b; A-R315-REVIEW-L2 fixed with the requesting-job exception (its own compute error still thrown from request(), PW29; queued jobs' errors rethrown on a timer, PW27); residual A-R403-L2-RESIDUAL-QUEUED-THROW (a queued job whose own compute throws stays loading; needs an error callback in the request API, ArrangementContext not granted) deferred Low. TL-R402-SK-L3, TL-R402-SK2-L1, TL-R402-SK2-L2 deferred Lows; TL-R402-SK-L4 kept (precedent)."),
 ('D-29z1386', "Docs for round 403: new doc 257 (l.4 'In Progress (stage 4 of 6; C round 403 PASS)'); doc 254 contract subsections (steps a-i, the 8 record rows), l.4 unchanged; doc 228 two edits only (GATE315-S8 'C round 312'; TODO bullet closed pointer), l.4 unchanged."),
 ('D-29z1387', "Order after round 403: REGRESSION-2026-11-10 at the first planning on/after 2026-11-10 (carries 14b-ii, 14c-i and the failing-worker fallback check); then PERF-14c-ii (measurement first), PERF-14c-iii, SYS-R385-LEAF-ACTIONS-CONTEXT, PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369, STEM-LANES, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule). Bounded frontend-architect checkpoint request for the lane + peaks owners at the end of PERF-14."),
]
for did, text in decisions:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})

pre(one('PERF-14b-ii'), 'done (D-29z1382): C round 402 PASS (14/14, browserVerified true), gate 402 published 7d7d7b2')
p14 = one('PERF-14')
pre(p14, 'in_progress (D-29z1383): 6 stages; 14a done (398), 14b-i done (400), 14b-ii done (402, 7d7d7b2); round 403 = 14c-i; then 14c-ii, 14c-iii')
c = one('PERF-14c')
pre(c, 'split (D-29z1383): 14c-i dispatched round 403; 14c-ii, 14c-iii not_started')
c['premise_d29z1383'] = 'b-round-402/probe/head-minzoom-*.json (HEAD 7d7d7b2, 200 clips): 1x <= 24 ms; 6x default 64 max, near-min 88/80 max; near-min 159 columns, 16-24 mounted alternating; consult b-round-402/consult-perf-14c-ii.md'
c['stages_d29z1383'] = [
  {'id': 'PERF-14c-i', 'what': 'peaks.client.ts hardening closing C-R315-T1/T2, A-R315-REVIEW-L1..L4, GATE315-S2, GATE315-S8 (PW14b, PW24, PW24b, PW25-PW29; requesting-job sync throw kept) + scale spec step i (zoom keys from min zoom, 1x and 6x, scrollLeft restored) with 8 record rows scale.zoom.min.* + doc 257 (stage 4 of 6), docs 254/228 sections', 'status': 'dispatched (D-29z1384): round 403 from b-round-402/sketch-403.patch.txt', 'sketch_evidence': 'b-round-402/sketch-review.md, mutants/summary.txt (8/8), sketch-full-vitest.log (261/3870), perf-sketch-scale-v2.json, probe/sketch-fallback-*.json'},
  {'id': 'PERF-14c-ii', 'what': 'first: measure at 6x >= 10 keys mutant A (PEAK_SHAPE_MAX_COLUMNS 512) and mutant B (fixed path) + CPU profile (consult-perf-14c-ii.md item 1). If path cost is small: fix near-min mount churn first (PERF-CAND-14-SCROLL-HYSTERESIS) and assert a mounted-delta-per-key row. Pyramid: max-only (render is symmetric; rule vs oss-adoption min/max wording), exact range-max over aligned power-of-two blocks so path literals stay byte-identical, lazy levels in a module WeakMap, sourcePeaks ReadonlyMap<string, Float32Array> and its 3 consumers unchanged; worker-built levels only if profiled', 'status': 'not_started'},
  {'id': 'PERF-14c-iii', 'what': 'canvas tiles for the visible page window (not whole clips; DPR cap; hidden-tab dirty redraw; gain scale as draw multiplier keeping the 0.02 floor and clamp); re-rule the starved rows interact.zoom.*.path-rewrites (perf/lib/zoom-probe.ts) and the arrangement-clip-waveform toHaveCount locators in the interactions, studio-lab and resources specs; tile-redraw count row', 'status': 'not_started'},
]
for lid in ['C-R315-T1', 'C-R315-T2', 'A-R315-REVIEW-L1', 'A-R315-REVIEW-L2', 'A-R315-REVIEW-L3', 'A-R315-REVIEW-L4', 'GATE315-S2', 'GATE315-S8']:
    pre(one(lid), 'fix_dispatched (D-29z1384): round 403 PERF-14c-i (b-round-402/sketch-403.patch.txt); closes on C round 403 PASS')
pre(one('C-R401-01'), 'closed (D-29z1382): C round 402 RT-FIX-401 PASS')
pre(one('TL-R398-SK-M1'), 'closed (D-29z1382): C round 402 rows 5 (PIN-BLUR-GROUP) and 10 (VZ8/VZ9, MU-402-NO-BLUR-UNPIN red) PASS; published 7d7d7b2')
pre(one('Q-14B-PIN-GROUP-MEMBERS'), 'closed (D-29z1382): ruling verified by C round 402 row 5 at both viewports')
pre(one('A-R400-REVIEW-SPEC-LOWS'), 'closed (D-29z1382): Lows 1, 2, 4 verified by C round 402 INTERACT (189 rows equal); Low 3 = A-R400-REVIEW-SPEC-L3 deferred')
b['open_findings'].append({'id': 'A-R402-REVIEW-F4', 'severity': 'low', 'origin': 'A round 402 code-reviewer', 'evidence': 'a-round-402.md; c-round-402.json notes[1]; c-round-402/f4-1440x900.json', 'title': 'a keyboard-focused clip that scrolls out of the window unmounts and focus falls to body', 'status': 'closed not_applicable (D-29z1382): C found no focusable element inside a clip (no tabIndex/button in ArrangementClip or its children; focusTarget null); reopen if a clip gains a tab stop', 'added': BY})
for fid, title, ev in [
 ('A-R402-REVIEW-F1', 'interactions spec (f) branches 2/3 assume the same page window at t0 and at the own-lane read; a Follow page move in the playing branch would name the wrong cause (no false pass)', 'a-round-402.md F1; candidate fix: record the page key at t0 and at the own-lane read'),
 ('A-R402-REVIEW-F2', 'scale.clips.model JSON note cites MU-399-NO-FILTER, which cannot affect a model count', 'a-round-402.md F2'),
 ('A-R402-REVIEW-F3', 'ArrangementLane reads gesturePinsRef.current during render; non-lazy useRef(new Map())', 'a-round-402.md F3; gates/round-402/review.md item 1'),
 ('A-R402-REVIEW-F5', 'no VZ row for pointercancel unpin, a pointerup from another pointerId keeping the pin, or a same-id re-press replacing it (candidate VZ11)', 'a-round-402.md F5'),
 ('A-R402-REVIEW-F8', 'scale.dom.page.min-zoom-mid 1868 is about 7 % under the 2000 budget (first row likely to trip as the UI grows)', 'a-round-402.md F8; gates/round-402/review.md item 5'),
 ('GATE402-L1', 'unpin does not re-render: a released pinned clip outside the window stays mounted until the next lane render', 'gates/round-402/review.md item 1'),
 ('GATE402-L2', 'gestureClipIds and mountedClips rebuilt on every lane render (O(clips))', 'gates/round-402/review.md item 2'),
 ('GATE402-L3', 'window blur unpin listener is not capture and not pointer-scoped; a blur mid-drag that returns leaves the drag unpinned', 'gates/round-402/review.md item 3'),
 ('TL-R402-SK-L3', 'scale spec step i (and step e): on a 6x abort the inner finally resets cpuRate before abortedAt, so short rows count against the wrong rate', 'b-round-402/sketch-review.md'),
 ('TL-R402-SK2-L1', 'peaks.client.ts requestingFailure not cleared in the request() finally (cannot leak today)', 'b-round-402/sketch-review.md pass 2'),
 ('TL-R402-SK2-L2', 'peaks.client.ts nested request() on a synchronous fake reply sets requesting = null for the outer call (test-only path; outer error falls back to rethrowLater)', 'b-round-402/sketch-review.md pass 2'),
 ('A-R403-L2-RESIDUAL-QUEUED-THROW', 'fallback loop: a queued (non-requesting) job whose own main-thread compute throws gets no peaks and its source stays loading; needs an error callback in the request API (ArrangementContext)', 'current-task.md round 403 D-29z1385'),
]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': ev.split(';')[0].split(' ')[0], 'evidence': ev, 'title': title, 'status': 'deferred_low_polish (D-29z1382/D-29z1385)', 'added': BY})
for tl, sev, title, disp in [
 ('TL-R402-SK-M1', 'medium', 'MU-403-REPLIED-ON-GARBAGE reachable via a pre-aborted request (not equivalent)', 'fixed before dispatch (PW24b; mutant red)'),
 ('TL-R402-SK-M2', 'medium', 'requesting job compute error no longer thrown from request() when failWorker runs inside request()', 'fixed before dispatch (requesting/takeRequestingFailure; PW29; MU-403-REQUESTING-DEFERRED red)'),
 ('TL-R402-SK-M3', 'medium', 'scale step i 1x and 6x measured different scroll states', 'fixed before dispatch (scrollLeft restored; 121.1/121.1)'),
 ('TL-R402-SK-L1', 'low', 'junk ack readable as valid in PW24', 'fixed before dispatch'),
 ('TL-R402-SK-L2', 'low', 'second CDP session in step i', 'fixed before dispatch (reuses cdp)'),
 ('TL-R402-SK-L4', 'low', 'budget notes cite loop b-round paths', 'kept (precedent of every PERF-14 note)'),
 ('TL-R402-SK-L5', 'low', 'new deterministic rows are a new harness failure mode', 'accepted (3/3 equal in two sketch runs; record rows)'),
]:
    b['open_findings'].append({'id': tl, 'severity': sev, 'origin': 'B sketch (tech-lead review)', 'evidence': 'b-round-402/sketch-review.md', 'title': title, 'status': f'closed (D-29z1384): {disp}; sketch input, never in app code', 'added': BY})
b['architecture_signals'].append({'id': 'A-R402-ARCH-PIN-TRACKING', 'origin': 'A round 402 code-reviewer', 'evidence': 'a-round-402.md Architecture note', 'signal': 'per-press window listeners in ArrangementLane sit next to claimPointerGesture and listen for the same end-of-press events; the page-window check is computed in both the lane and ArrangementClip. Candidate: move pin tracking into claimPointerGesture or a small usePointerPressPins under app/lib/arrangement/ (VZ5/VZ8/VZ9 unchanged, useArrangement() shape unchanged)', 'status': 'signal (D-29z1382), not scheduled; input to the end-of-PERF-14 frontend-architect checkpoint request', 'added': BY})
hy = one('PERF-CAND-14-SCROLL-HYSTERESIS')
hy['note_d29z1383'] = 'near-min zoom keys at 6x (48-88 ms) are dominated by mount churn (16-24 clips alternating per key; b-round-402/probe/head-minzoom-6x-*.json, consult-perf-14c-ii.md); first candidate fix at the 14c-ii planning if the column-cap/fixed-path mutants show path cost is small'
rg = one('REGRESSION-2026-11-10')
rg['scope_additions_d29z1387'] = ['PERF-14b-ii (round 402): frames200 + pin-blur-group short checks at both viewports', 'PERF-14c-i (round 403, if C PASS): peaks-fallback.cjs failing mode at both viewports', 'export WAV samples/duration and audio graph output (carried from round 402 notes)']
q7 = b['post_current_stage_queue'][7]
assert q7['id'] == 'STUDIO-PERFORMANCE'
pre(q7, 'in_progress (D-29z1387): PERF-14b-ii done (7d7d7b2); round 403 = PERF-14c-i; then REGRESSION-2026-11-10 when due, PERF-14c-ii, 14c-iii, SYS-R385-LEAF-ACTIONS-CONTEXT, PERF-15, SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369')
for r in b['retro_runs']:
    if isinstance(r, dict) and r.get('round') == 401:
        r['status_d29z1382'] = 'done: RT-FIX-401 PASS in C round 402'
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 402:
        r['status'] = 'C PASS (c-round-402.json, browserVerified true); gate 402 published 7d7d7b2'
b['rounds'].append({'round': 403, 'task': 'current-task.md', 'decision': 'D-29z1382..D-29z1387', 'type': 'PERF-14c-i peaks client hardening + min-zoom harness record rows (PERF-14 stage 4 of 6)', 'status': 'dispatched', 'note': 'baseline 7d7d7b2 clean; frozen b-round-402/r403-frozen-sha256.txt (1290); grants b-round-402/grants-403.txt (7); patch b-round-402/sketch-403.patch.txt; claims b-round-402/claims-403.sh', 'added': BY})
b['current_task'] = 'Round 403: PERF-14c-i peaks client hardening (8 round-315 Lows) + min-zoom zoom-key record rows (PERF-14 stage 4 of 6) from B reviewed sketch b-round-402/sketch-403.patch.txt (current-task.md)'
b['version'] = 371
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v370 -> v371\n')
print('ok v371')
