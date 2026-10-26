import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
ADDED = "2026-10-26 B round 183 -> 184 planning (D-29z149)"
b['updated'] = "2026-10-26 (B round 183 -> 184 planning, D-29z149)"
b['current_task'] = ("current-task.md (round 184: D-29z149 - ROOT-RECON-GRID-HARNESS, test-only: new app/lib/arrangement/__tests__/helpers/"
  "workspace-test-environment.ts exporting createWorkspaceTestEnvironment() (fresh fakeClock + FakeAudioContext/OfflineAudioContext/"
  "AudioBuffer/ResizeObserver per call); grid-snap-ui l.23-101, grid-musical-ui l.29-107, grid-triplet-ui l.30-108 (byte-identical blocks) "
  "replaced by one import + one destructure each; beforeEach/afterEach and every assertion byte-identical; 45-test name lock "
  "b-round-183/out/vitest-base-names.txt (20/14/11); doc 151 Completed; new doc 152; baseline HEAD 423fbc4 (gate 183 published), "
  "1009 tracked, grants 4, new 2, frozen 1005)")
for r in b['rounds']:
    if r.get('round') == 183:
        r['status'] = 'c_pass_published'
        r['result'] = "C PASS (c-round-183.json: browserVerified=true, realVerified=true, 0 bugs, 12 rows passed; G183-3 fake-Bearer 403 BLOCKED backend unavailable in cloud); gate 183 published 423fbc4 on both remotes"
        r['closed'] = ADDED
b['rounds'].append({"round": 184, "task": "current-task.md", "decision": "D-29z149", "status": "dispatched",
  "items": ["ROOT-RECON-GRID-HARNESS: createWorkspaceTestEnvironment extraction (3 grid UI suites, test-only)", "doc 151 Completed (C round 183 PASS, 423fbc4)"],
  "note": "baseline HEAD 423fbc4 (gate 183 published, clean tree, c-round-183/end-tree-sha256.txt 1009 OK); grants b-round-183-r184-grants.txt (4); new b-round-183-r184-new-files.txt (2); frozen 1005 (b-round-183-r184-tree-sha256.txt OK); start copies b-round-183/r184-granted-start/; vitest base b-round-183-r184-vitest-base.txt = after list (3 files, 45 tests, B run 45/45 green, names b-round-183/out/vitest-base-names.txt)",
  "added": ADDED})
q = {e['id']: e for e in b['post_current_stage_queue']}
v = q['VISUAL-A-OBSIDIAN']
v['status'] += (" | round 184 planning (D-29z149): M4 done (round 183 C PASS browserVerified=true realVerified=true, 0 bugs, published 423fbc4; vetoable R44/R45); "
  "regression not due at planning (regression-last 2026-10-24, 2 days on 2026-10-26) -> order flips vs D-29z148 section 8: ROOT-RECON-GRID-HARNESS = round 184 (VISUAL-A exit item), "
  "REGRESSION = first planning on/after 2026-10-27 (expected round 185, incl. M1, M3, M4); frontend-architect checkpoint re-raised as b-round-183-checkpoint-request.md (supersedes b-round-180, non-blocking)")
for i, o in enumerate(v['order']):
    if o.startswith('M4 cookie banner'):
        v['order'][i] = o + " | D-29z149: M4 done (round 183, 423fbc4; vetoable R44/R45)"
    if o.startswith('ROOT-RECON-GRID-HARNESS'):
        v['order'][i] = o + " | D-29z149: round 184 (createWorkspaceTestEnvironment in app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts; 3 grid UI suites; 45-name lock)"
v['harness_plan_d29z149'] = {
  "round": 184,
  "approved": "agent-workflow.md reconciliation 2026-10-25 item 2 (user-approved test-only extraction; local 3ea2e04 is not in the cloud, so it is re-done from the canonical f08c7ce-lineage files, not cherry-picked)",
  "b_check": "B diffed the three blocks at HEAD 423fbc4: grid-snap-ui l.23-101 == grid-musical-ui l.29-107 == grid-triplet-ui l.30-108 (79 lines, fakeClock .. FakeResizeObserver, byte-identical). fakeClock is used 3x per file (decl, currentTime, beforeEach base reset); Fake classes after the block only in beforeEach stubGlobal lines. B ran the 3 suites at HEAD: 45/45 green (20/14/11).",
  "change": "new helper exports createWorkspaceTestEnvironment(); each call creates a fresh fakeClock {base:0} and fresh class definitions closing over it; returns {fakeClock, FakeAudioContext, FakeOfflineAudioContext, FakeAudioBuffer, FakeResizeObserver}; FakeParam/FakeNode/FakeGain/FakePanner/FakeSource stay internal. Each suite: delete the block, add import + one module-scope destructure in the block's place; beforeEach/afterEach/assertions byte-identical.",
  "not_in_scope": "the other 73 suites with copies of the block, expectTokens/countOccurrences (checkpoint Q2, root's call), any source file",
  "rulings": {"R47": "module-scope destructure, not a beforeEach-created env: keeps setup/teardown text byte-identical (the approved constraint) while each suite still owns its clock/classes (one factory call per module).",
              "R48": "helper path app/lib/arrangement/__tests__/helpers/ (no .test. suffix -> not collected by vitest include app/**/*.test.{ts,tsx}; covered by tsconfig include for typecheck).",
              "R49": "45-name lock: the sorted file::fullName::status list after the change must equal b-round-183/out/vitest-base-names.txt; any drift is a FAIL, not a note."},
  "ableton": "not applicable (test-only; no behaviour change)",
  "added": ADDED}
h = None
for f in b['open_findings']:
    if f.get('id') == 'ROOT-RECON-GRID-HARNESS':
        f['status'] = 'scheduled: round 184 (D-29z149)'
        f['plan_d29z149'] = "45-test live base (old 44/1683 applied only to 3ea2e04); doc number 152 (063 taken, 151 last used); see VISUAL-A harness_plan_d29z149"
    if f.get('id') == 'M4-COOKIE-GRANT':
        f['status'] = 'resolved (round 183 C PASS, 423fbc4)'
b['open_findings'] += [
  {"id": "C-R183-M310-CC5-UNREACHABLE", "severity": "info", "status": "triaged_info",
   "title": "CC5 'decision exists -> nothing on /' cannot detect a predicate inversion (m310 stays green there)",
   "evidence": "a-round-183.md mutations table; c-round-183.json notes[0]",
   "b_ruling": "expected: with a stored decision the effect returns before the timer, so the route predicate is never reached; 7/8 tests catch m310. No test change required; optional test-only Low if CookieConsent is touched again.",
   "added": ADDED}]
b['deferred_low_polish'] += [
  {"id": "C-R183-N-CLOSE-0X0", "severity": "low", "status": "deferred_low_polish",
   "title": "CookieConsent Close (X) button measures 0x0 at 1440 and 1280 (hidden at this breakpoint) - pre-existing, identical on HEAD f22290f",
   "evidence": "c-round-183.md Notes for B; c-round-183/out/c183-ga-run1.json", "repro": "GA-env server, '/', wait 1.5 s, measure the banner's close button rect",
   "owner_note": "Store CookieConsent.tsx; may be a deliberate responsive hide - verify intent before changing", "added": ADDED},
  {"id": "A-R183-COOKIE-BUTTON-TYPE", "severity": "low", "status": "deferred_low_polish",
   "title": "CookieConsent.tsx: 3 <button> elements without type (Biome lint/a11y/useButtonType) - pre-existing on f22290f",
   "evidence": "a-round-183.md Tests actually run (biome check)", "repro": "npx biome check app/components/common/CookieConsent.tsx", "added": ADDED},
  {"id": "A-R183-COOKIE-INLINE-GRADIENT", "severity": "low", "status": "deferred_low_polish",
   "title": "CookieConsent.tsx inline rgba gradient style (Tailwind-first / tokens rule) - pre-existing",
   "evidence": "a-round-183.md Known gaps; current-task round 183 section 1 constraints", "repro": "read CookieConsent.tsx banner root style", "added": ADDED},
  {"id": "A-R183-REVIEW-FBQ-BRANCH", "severity": "low", "status": "deferred_low_polish",
   "title": "CookieConsent handleAccept fbq branch not exercised in jsdom tests",
   "evidence": "a-round-183.md Code review Low (not addressed)", "repro": "CookieConsent.test.tsx has no window.fbq stub", "owner_note": "test-only", "added": ADDED}]
b['architecture_signals'].append({"round": 183,
  "note": "A reviewer and gate-183 reviewer (coupling, mild, keep): Studio route predicate duplicated at root.tsx:137 and CookieConsent.tsx:16. Proposal when root.tsx unfreezes: one isStudioPathname(pathname) in ~/lib used by both, or AppContent passes a hidden prop; acceptance CC1-CC5 green, Header/AudioPlayer hiding unchanged. Signal only, not scheduled (root.tsx is global_forbidden).",
  "added": ADDED})
for r in b['regression_rounds']:
    if 'ROUND-2026-10-27' in json.dumps(r) and r.get('status') == 'planned':
        r['round'] = "expected 185 (first planning on/after 2026-10-27; round 183 = M4 and round 184 = ROOT-RECON-GRID-HARNESS were planned 2026-10-26)"
        r['scope_additions'].append("M4 (round 183 C PASS, 423fbc4): on a GA-env server copy (own vite cacheDir, GA hosts aborted) no banner on /studio-lab and /studio/:id; banner present on '/' at (0,832)/(0,652); on :5173 Studio rest unchanged")
        r['scope_additions'].append("ROOT-RECON-GRID-HARNESS (if round 184 C PASS): no browser surface; covered by the gate's full vitest; C only confirms the 3 grid suites stay in the gate log")
        r['added_d29z149'] = ADDED
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
