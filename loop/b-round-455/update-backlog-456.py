# B round 455 -> 456 backlog edit: close round 455 from C/gate evidence, record findings, dispatch round 456 (STORE-2b-3c-2a). Idempotent via marker.
import json, os, sys, shutil
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'b-round-455')
mark = os.path.join(B, 'update-backlog-456.done')
if os.path.exists(mark):
    sys.exit('already applied')
p = os.path.join(L, 'backlog.json')
shutil.copy2(p, os.path.join(B, 'backlog-before-456.json'))
b = json.load(open(p, encoding='utf-8'))
assert b['version'] == 447, b['version']
BY = '2026-11-11 B round 455 -> 456 planning'
b['version'] = 448
CHECKPOINT = open(os.path.join(B, 'checkpoint-decision.txt'), encoding='utf-8').read().strip()

def find(lst, fid):
    r = [f for f in b[lst] if f.get('id') == fid]
    assert len(r) == 1, (lst, fid, len(r))
    return r[0]

# 1. close round 455
r455 = [r for r in b['rounds'] if r.get('round') == 455][0]
r455['status'] = 'c_pass_published'
r455['result'] = 'C round 455 PASS (c-round-455.json: C1-C9 passed, browserVerified/realVerified true, 0 bugs; blocked: TLM-R455-FIREFOX-SEEK-THUMB (Firefox not in cloud, deadline RETRO 465)); gate 455 published db95f40 (review COMMIT OK 9/10, verify 284 files / 4148 tests green, build ok) (D-29z1618)'
s14 = find('open_findings', 'SABA-B-14')
s14['status'] = 'done (D-29z1618): C round 455 PASS browserVerified true (HEAD lead 7 px -> tree 0 px at 10 samples both viewports, playing crops, keyboard, volume, hover, drag), gate 455 published db95f40 | ' + s14['status']
q = [q for q in b['post_current_stage_queue'] if q['id'] == 'STORE-REDESIGN'][0]
sp = [s for s in q['stages'] if s['id'] == 'STORE-2'][0]['split_2b_d29z1583']
sp['SABA-B-14-insert'] = 'done (D-29z1618): C round 455 PASS, published db95f40 | ' + sp['SABA-B-14-insert']
sp['STORE-2b-3c-2'] = 'split (D-29z1619): 2b-3c-2a = round 456 (shared nesting-aware CSS rule reader + mounted-consumer check LT7/LT8 for A-R454-REVIEW-M-DEAD-UNCHECKED + GS gaps; test-only) | 2b-3c-2b = zero-offset glow regex forms (A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC, GATE452-L1 precheck), all Low/info, after SABA-B-13 | ' + sp['STORE-2b-3c-2']
sp['STORE-2b-3c-2a'] = 'dispatched round 456 (D-29z1619)'
sp['STORE-2b-3c-2b'] = 'not_started (D-29z1619): after STORE-2b-ENTRANCE (SABA-B-13), before 2b-3d; Low/info only'
q['status'] = 'in_progress (D-29z1619): round 456 = STORE-2b-3c-2a (test-only shared rule reader + dead-consumer check); then REGRESSION-2026-11-13 if planned on/after 11-13, SABA-B-13 entrance, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c..5 | ' + q['status']

# 2. round-455 findings
lp = find('deferred_low_polish', 'A-R454-REVIEW-L1')  # existence check only
b['deferred_low_polish'].append({'id': 'A-R455-REVIEW-L1-NONFINITE-DURATION', 'severity': 'low', 'origin': 'A code-reviewer round 455 (R455-1)', 'status': 'deferred_low_polish (D-29z1618); owner STORE-2c (player restyle) or the polish pass', 'title': 'AudioPlayer progress key handler and disabled guard do not reject non-finite duration; seek(NaN) would throw on audio.currentTime (not a regression: old onChange path had the same exposure)', 'evidence': 'a-round-455.md R455-1; gates/round-455/review.md finding 1', 'repro': 'duration NaN/Infinity from loadedmetadata (stream): input enabled, ArrowRight -> seek(NaN) -> TypeError', 'confirmedBy': ['GATE455-F1 (gates/round-455/review.md finding 1, fix: !Number.isFinite(duration) || duration <= 0 + early return)']})
b['deferred_low_polish'].append({'id': 'B-R455-DOC298-STATUS-LINE', 'severity': 'low', 'origin': 'B spec (task 455 pinned l.4 "In Progress" against lesson L28)', 'status': 'scheduled (D-29z1619): fixed in round 456 (grant: doc 298 l.4 only -> "**სტატუსი:** Completed (C round 455 PASS)")', 'title': 'doc 298 l.4 reads In Progress at HEAD db95f40 although C round 455 passed', 'evidence': 'a-round-455.md top note; c-round-455.json notes; gates/round-455/review.md suggestions'})
for iid, title, ev in [
    ('INFO-A-R455-ALTLEFT-UNIT', 'Alt+ArrowLeft no-navigation covered only by the browser probe (C5), not a unit test', 'a-round-455.md R455-4'),
    ('INFO-A-R455-RECORD-LOOKUP', 'Record<string, number> key lookup with === undefined; a switch or ReadonlyMap would type it honestly', 'a-round-455.md R455-5'),
    ('INFO-A-R455-RGBA-TOKEN', 'rgba(255, 255, 255, 0.1) track colour in AudioPlayer is hardcoded (pre-existing, moved); token candidate', 'a-round-455.md R455-6; gates/round-455/review.md suggestion 2'),
    ('INFO-B455-ALTLEFT-PROBE-LABELS', 'b-round-454/probe altleft-5173/5181 files are named for the opposite trees; the task text matched what C observed', 'c-round-455.json notes'),
]:
    b['open_findings'].append({'id': iid, 'severity': 'info', 'origin': 'B pre-check' if 'B455' in iid else 'A code-reviewer round 455', 'status': 'logged (D-29z1618)', 'title': title, 'evidence': ev})
b['architecture_signals'].append({'id': 'SIG-R455-RANGE-FILL', 'added': BY, 'source': 'A round-455 code-reviewer Architecture note + gate 455 reviewer (Architecture note, Alternative Approach)', 'note': 'audioPlayerRangeFill and AUDIO_PLAYER_THUMB_PX live in AudioPlayer.tsx and duplicate the 12 px thumb in app.css (ST8 string guard). If a second painted range slider appears, move the helper to lib/ with a --audio-thumb CSS variable (or drive the fill by a --fill custom property in app.css). Signal, not a task.'})

# 3. round 456 ownership updates
for lst, fid, note in [
    ('open_findings', 'A-R454-REVIEW-M-DEAD-UNCHECKED', 'in_progress (D-29z1619): round 456 LT7 (token consumers + name-precise mount walker) and LT8 (walker self-test)'),
    ('deferred_low_polish', 'TL-R454-L-BRACE-PREFIX-HEADER', 'in_progress (D-29z1619): round 456 shared rule reader (LT6 fixture "} .live:hover")'),
    ('deferred_low_polish', 'A-R453-REVIEW-L-GS-TEST-GAPS', 'in_progress (D-29z1619): round 456 (GS2 accent utility, GS3 shared cssRuleBodies + brand fill, GS4 quoted/nested samples)'),
    ('deferred_low_polish', 'A-R454-REVIEW-L3', 'in_progress (D-29z1619): round 456 LT1 counts every rule listing the selector (also @media copies) and checks each body teal/glow-free'),
    ('deferred_low_polish', 'A-R454-REVIEW-L4', 'in_progress (D-29z1619): round 456 hitsByCssRule closes the @theme bucket on its brace'),
    ('deferred_low_polish', 'A-R451-REVIEW-L2-ZERO-OFFSET-UNITS', 'owner STORE-2b-3c-2b (D-29z1619), after SABA-B-13'),
    ('open_findings', 'INFO-TL-R451-GLOW-CALC', 'owner STORE-2b-3c-2b (D-29z1619), after SABA-B-13'),
    ('deferred_low_polish', 'GATE452-L1-GLOW-REGEX-WHOLE-SOURCE', 'owner STORE-2b-3c-2b (D-29z1619) with the glow regex forms'),
]:
    f = find(lst, fid)
    f['status'] = note + ' | ' + f['status']
for sid in ['SIG-R453-CSSRULEBODIES', 'SIG-R454-HITSBYRULE']:
    s = find('architecture_signals', sid)
    s['status'] = 'acted on in round 456 sketch (D-29z1619): cssRuleBlocks/cssRuleBodies/hitsByCssRule in helpers/style-scan.ts'
s = find('architecture_signals', 'SIG-R454-ALLOWLIST-PINS')
s['status'] = 'watch (D-29z1619): round 456 rewrites the keys once (drops " {"), counts unchanged; still a signal'
s13 = find('open_findings', 'SABA-B-13')
s13['status'] = 'scheduled (D-29z1619): STORE-2b-ENTRANCE right after round 456 (REGRESSION-2026-11-13 first if planned on/after 11-13) | ' + s13['status']

b['deferred_low_polish'].append({'id': 'TL-R455-WALKER-LIMITS', 'severity': 'low', 'origin': 'B spec (tech-lead review of the round-456 sketch v1, b-round-455/sketch-review.md)', 'status': 'deferred_low_polish (D-29z1619); owner the ARCH-CHECKPOINT-STYLE-SCAN extraction if approved, else 2b-3c-2b', 'title': 'round-456 helper limits: side-effect imports (no from) not followed; type-only and commented imports count as reachable (fail-closed); a block open at EOF is dropped; teal in selectors/at-rule conditions not counted per rule; @starting-style and nested & rules invisible; AudioPreviewButton aliased import or createElement and a > inside a string attribute escape elementTags; keyframe header check accepts a comma list that also names a live selector; LT1 reads each file twice; (v2 delta review) export * as NS from a barrel forwards NS and misses inner files; overlay branch not asserted to contain return (; @theme check uses endsWith + >= 5; bracedBlockAfter counts braces in strings (fails closed); deadRuleText re-reads per key', 'evidence': 'b-round-455/sketch-review.md reviews 1 and 2 Lows'})
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-STYLE-SCAN', 'added': BY, 'file': 'b-round-455-checkpoint-request.md', 'scope': 'app/lib/__tests__/helpers/style-scan.ts and its 4 importers (test helpers only)', 'question': 'split into helpers/css-rules.ts + helpers/module-graph.ts; one shared dead-code allow-list data file; GT5 word-match -> reachableScripts', 'status': 'filed with root (D-29z1619): non-blocking; preferred before 2b-3c-2b is planned', 'signals': ['SIG-R453-CSSRULEBODIES', 'SIG-R454-HITSBYRULE', 'SIG-R454-ALLOWLIST-PINS', 'gates/round-452/review.md architecture note'], 'confirmedBy': 'tech-lead review of the round-456 sketch (b-round-455/sketch-review.md, Architecture)'})

# 4. decisions + round 456
b['decisions_log_b'].append({'id': 'D-29z1618', 'date': '2026-11-11', 'by': BY, 'decision': 'Round 455 closed from evidence: C round 455 PASS (C1-C9, browserVerified/realVerified true, 0 bugs) + gate 455 published db95f40 (review COMMIT OK 9/10; verify 284/4148) -> SABA-B-14 done; new baseline db95f40 (context/head-sha.txt and the gate head field still name 2e26962; the gate commit field wins). TLM-R455-FIREFOX-SEEK-THUMB stays open (deadline RETRO 465). R455-1 -> deferred_low_polish A-R455-REVIEW-L1-NONFINITE-DURATION confirmedBy gate finding 1; R455-2/R455-3 were fixed in doc 298 by A; R455-4/5/6 and the swapped probe labels -> info; the range-fill architecture notes -> SIG-R455-RANGE-FILL (no task). Doc 298 l.4 ruling: B spec defect (task pinned In Progress against L28) -> B-R455-DOC298-STATUS-LINE, fixed by a one-line grant in round 456; lesson L28 gains the B clause (lessons.md stays 60 lines, backup b-round-455/lessons-before-456.md).'})
b['decisions_log_b'].append({'id': 'D-29z1619', 'date': '2026-11-11', 'by': BY, 'decision': 'Round 456 = STORE-2b-3c-2a (test-only), keeping the recorded order (D-29z1616/1617): no new Saba or root file, SABA-B-13 needs its own product-designer consult, reference and production-build probe; its policy slot is "STORE-2b or STORE-3". 2b-3c-2 split to stay one feature: 2a = shared nesting-aware CSS rule reader (cssRuleBlocks/cssRuleBodies/cssRuleBlocksListing/cssRuleSelectorCount/hitsByCssRule) replacing hitsByEnclosingRule and ruleBodiesFor, plus LT7 mounted-consumer check (explicit token->consumer table; consumers unreachable from root/entries/routes by a name-precise barrel walker reusing resolvedImports; AudioPreviewButton overlay-only; dead keyframes used only under dead classes) and LT8 walker self-test, plus GS gaps; 2b = zero-offset glow regex forms (Low/info) after SABA-B-13. B measured at HEAD: rule-reader keys and counts equal the old allow-list (app.css 37, utilities.css 6); 6 dead tokens have consumers only in unreachable files (TrackRow, WaveForm, TrackRowSkeleton, PianoLoadingAnimation) or the overlay-only AudioPreviewButton; whole-barrel walking would mark them reachable (control). LT1 now counts the @media copy of .audio-player-artwork (2). 15 mutants red, BASE + live-barrel control green. A-R454-REVIEW-L1 (.code-4 undefined token) stays with 2b-3d (needs app.css). Architecture checkpoint: ' + CHECKPOINT})
b['rounds'].append({'round': 456, 'task': 'current-task.md', 'decision': 'D-29z1619', 'type': 'STORE-2b-3c-2a shared CSS rule reader + dead-consumer check (test-only)', 'status': 'dispatched', 'note': 'baseline db95f40 (gate 455 published); sketch b-round-455/sketch-456.patch.txt; grants b-round-455/grants-456.txt (5: 3 test files, doc 298 l.4, new doc 299); claims b-round-455/claims-456.sh; covering b-round-455/covering-456.txt (4 files); mutants b-round-455/mutants/mutants.txt'})
b['current_task'] = 'Round 456: STORE-2b-3c-2a shared CSS rule reader + dead-consumer check (current-task.md, D-29z1619)'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(mark, 'w').write('ok\n')
print('applied 456')
