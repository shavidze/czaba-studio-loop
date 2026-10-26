import json, sys
p = sys.argv[1]
b = json.load(open(p, encoding='utf-8'))
ADDED = "2026-10-26 B round 184 -> 185 planning (D-29z150)"
b['updated'] = "2026-10-26 (B round 184 -> 185 planning, D-29z150)"
b['current_task'] = ("current-task.md (round 185: D-29z150 - STORE-0 mock API: new loop-folder tmp/studio-real-loop/mock-api/server.mjs + selftest.mjs + README.md "
  "(dependency-free Node on 127.0.0.1/[::1]:5199; client.ts envelope; 8-product fixture 5 Track/2 SFX/1 Loop, 1 inactive, middle-east, local previews/images; "
  "cart GET empty, writes 501; auth/downloads/orders 401 for any Authorization (P1), no Set-Cookie (P2); CORS echo for 127.0.0.1/localhost origins); "
  "store: doc 152 Completed only; baseline HEAD 3eb4cdb (gate 184 published), 1011 tracked, grant 1, new store 0, frozen 1010)")
for r in b['rounds']:
    if r.get('round') == 184:
        r['status'] = 'c_pass_published'
        r['result'] = "C PASS (c-round-184.json: browserVerified=true, realVerified=true, 0 bugs, 8 rows passed; G184-3 fake-Bearer 403 BLOCKED backend unavailable in cloud); gate 184 published 3eb4cdb on both remotes"
        r['closed'] = ADDED
b['rounds'].append({"round": 185, "task": "current-task.md", "decision": "D-29z150", "status": "dispatched",
  "items": ["STORE-0 mock API (loop folder: mock-api/server.mjs, selftest.mjs, README.md)", "doc 152 Completed (C round 184 PASS, 3eb4cdb)"],
  "note": "baseline HEAD 3eb4cdb (gate 184 published, clean tree, c-round-184/end-tree-sha256.txt OK, 1011 tracked); grants b-round-184-r185-grants.txt (1: doc 152); new b-round-184-r185-new-files.txt (store 0, loop 3); frozen 1010 (b-round-184-r185-tree-sha256.txt OK); start copy b-round-184/r185-granted-start/; vitest base: none (no store code)",
  "added": ADDED})
q = {e['id']: e for e in b['post_current_stage_queue']}
v = q['VISUAL-A-OBSIDIAN']
v['status'] = ("complete (except awaiting_user items) - closed at round 184: ROOT-RECON-GRID-HARNESS C PASS browserVerified=true realVerified=true, 0 bugs, published 3eb4cdb | history: " + v['status'])
for i, o in enumerate(v['order']):
    if o.startswith('ROOT-RECON-GRID-HARNESS'):
        v['order'][i] = o + " | D-29z150: done (round 184 C PASS, 3eb4cdb; 45-name lock held; m313 0 red -> signal B-R184-FAKECLOCK-UNASSERTED)"
s = q['STORE-REDESIGN']
s['status'] = "in_progress: STORE-0 = round 185 (D-29z150); STORE-1..5 not_started (direction A decided 2026-10-25)"
for st in s['stages']:
    if st['id'] == 'STORE-0':
        st['status'] = 'scheduled: round 185 (D-29z150)'
s['store0_plan_d29z150'] = {
  "round": 185,
  "b_check": "B read at 3eb4cdb: client.ts envelope {success,data,message} l.35-40/450-456, ApiError on non-OK l.444-448, 401 handling l.389-441; _index loader getProducts(pageSize 12) isActive filter, ProductSection shows <=8; store.tsx getProducts(search,category,genre,pageSize 50), mapCategory track/sfx/loop/preset; products.$handle ApiError 404 -> 404 else 503; productAdapter empty audioPreviewUrl falls back to R2 worker host (forbidden); CartContext browser getCart cross-origin with credentials + X-Session-Id (needs CORS preflight); api.studio-token.ts calls API_URL/api/downloads with any Bearer and signs a token if success+owned track (a permissive mock would bypass purchase protection); smoke config uses API_URL :51999 (unaffected).",
  "change": "loop-folder only: mock-api/server.mjs (dependency-free Node 22, 127.0.0.1 + [::1]:5199, MOCK_API_PORT override, per-request log without Authorization value), selftest.mjs, README.md (Georgian); store: doc 152 status Completed only",
  "fixture": "8 Product objects typed exactly as client.ts (no extra fields): 5 Track (incl. handle middle-east; >=2 with Standard/Premium variants, Premium includesStems true; >=1 isNew, >=1 isPremium), 2 SFX (1 isActive false), 1 Loop; every audioPreviewUrl /middle-east.mp3 or /videos/hero/hero-music.mp3; every imageUrl /images/packs/*; distinct createdAt; vendor CZABA; neutral test titles, no invented facts",
  "protection": {"P1": "never success:true on /api/downloads*, /api/auth/*, /api/orders* whatever the headers -> studio-token fake Bearer = 403 Unable to verify ownership",
                 "P2": "never Set-Cookie", "P3": "no secrets/.env, no outbound network, no file reads outside its folder, serves no files", "P4": "not a store dependency, not committed to the store, does not touch store processes"},
  "rulings": {"R50": "no store implementation doc for STORE-0 (loop-folder only by design); mock-api/README.md documents it; STORE-1 gets doc 153 (vetoable)",
              "R51": "cart write endpoints answer 501 with a clear mock message instead of a fake success (spec: empty or anonymous answers; a fake success would show items no backend accepted) (vetoable)"},
  "c_rows": ["MOCK-SELF-185", "MOCK-TYPES-185", "STORE-HOME-185", "STORE-LIST-185", "STORE-PRODUCT-185", "CART-185", "G185-3 (fake-Bearer 403 now mock-backed; not real-backend evidence)", "STUDIO-RV-185", "SCOPE-185", "AN-REVIEW-185", "PX-NET/REG-HYD"],
  "baselines": "C's STORE-HOME/LIST/PRODUCT screenshots at 1440/1280/375 + home LCP/CLS medians are the STORE 'before' baseline for STORE-1..5 (not pass/fail in round 185)",
  "ableton": "not applicable (store verification infrastructure)",
  "added": ADDED}
for f in b['open_findings']:
    if f.get('id') == 'ROOT-RECON-GRID-HARNESS':
        f['status'] = 'resolved (round 184 C PASS browserVerified=true, published 3eb4cdb)'
        f['closed'] = ADDED
b['open_findings'] += [
  {"id": "B-R184-FAKECLOCK-UNASSERTED", "severity": "info", "status": "signal_not_scheduled",
   "title": "m313 (FakeAudioContext.currentTime forced to 0) turned 0 of 45 grid UI tests red: the fake clock value is not asserted through the 3 grid suites",
   "evidence": "a-round-184/mut/m313-vitest.json, m313-red.txt (empty); c-round-184.md MUT-184; gates/round-184/review.md suggestion 1",
   "b_ruling": "test-coverage gap, not a defect; candidate one-assertion test-only task (playhead/currentTime advances after Play with Date.now mocked) when the grid suites are next owned or in the final polish pass; not scheduled ahead of STORE-REDESIGN",
   "added": ADDED},
  {"id": "C-R184-EXPORT-FULLSCALE-INFO", "severity": "info", "status": "info",
   "title": "flow smoke export has 30 full-scale samples; the decoded source /middle-east.mp3 has the same 30 -> unity pass-through, no added clipping",
   "evidence": "c-round-184.md informational flow smoke; c-round-184/out/src-peak.json", "b_ruling": "same family as C-R178-EXPORT-CLIPS-AT-0DB (product question, info); no task", "added": ADDED}]
b['architecture_signals'].append({"round": 184, "note": "A reviewer and gate-184 reviewer (Signal 3, keep): the 79-line Web Audio/ResizeObserver fakes block is still copied in 73 other suites; proposal: bounded test-only batches (<=10 suites) onto createWorkspaceTestEnvironment with name lock + per-suite wiring mutation, only for suites whose copy is identical; optional export type WorkspaceTestEnvironment only if that migration happens. Already checkpoint Q2 in b-round-183-checkpoint-request.md (unanswered, fallback (c): not migrated). Not scheduled.", "added": ADDED})
rr = b['regression_rounds'][-1]
rr['round'] = "expected 186 (first planning on/after 2026-10-27; round 184 = harness and round 185 = STORE-0 were planned 2026-10-26)"
rr.setdefault('scope_additions', []).extend([
  "ROOT-RECON-GRID-HARNESS (round 184 C PASS, 3eb4cdb): no browser surface; gate log still collects the 3 grid suites (20/14/11) and not the helper",
  "STORE-0 (if round 185 C PASS): one store smoke against the mock (/, /store, /products/middle-east render fixture data; studio-token fake Bearer 403)"])
rr['added_d29z150'] = ADDED
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
