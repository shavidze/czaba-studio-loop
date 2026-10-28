import json
P='backlog.json'
b=json.load(open(P))
T='2026-10-28 B round 221 -> 222 planning'
b['version']=207
b['updated']='2026-10-28 B round 221 -> 222 planning (D-29z237..D-29z242)'
b['current_task']="current-task.md (round 222, D-29z237..D-29z242; B-R220-LEGACY-EXPORT-NO-STEMS: purchased-Studio ExportDialog selects every stem when the stem-ID set changes, same-ID rebuilds (mute/solo/volume) and close/reopen keep user toggles; narrow grant app/components/studio/ExportDialog.tsx (selection state only) + new app/lib/__tests__/legacy-export-dialog-stems.test.tsx (ES1-ES7) + doc 174; C browser rows LEGACY-UI-STUBBED-222 10/10 + MP3 High, SUBSET-AUDIO-222 spectral, PERSIST-222, SELECT-ALL-222, ABLETON-TAB-222, LAB-SMOKE-222, G222-3 unstubbed; LEGACY-OWNERSHIP-222 backend-blocked; baseline 6dd45a1; frozen 1069)"
# rounds
for r in b['rounds']:
    if r.get('round')==221:
        r['status']='c_pass_published'
        r['result']='C PASS 13 rows (browserVerified=true, realVerified=true; LEGACY-OWNERSHIP-221 backend-blocked; DEPS-221 literal wording not met only by an empty node_modules/@ffmpeg dir = C-R221-01 Low, ruled D-29z239); gate 221 published 6dd45a1 (verify 202 files, licence test 67/67)'
b['rounds'].append({"round":222,"task":"current-task.md","decision":"D-29z237..D-29z242","status":"dispatched","type":"B-R220-LEGACY-EXPORT-NO-STEMS (Medium bug fix, legacy ExportDialog stem selection)","note":"baseline 6dd45a1; frozen 1069 (b-round-221-r222-tree-sha256.txt); grants 1 narrow (b-round-221-r222-grants.txt); new 2 (b-round-221-r222-new-files.txt); root-owned package*.json + vite.config.ts must equal HEAD; no deps request","next":"PASS + before 2026-10-30 -> round 223 PERF-HARNESS-SHARED-LIB; on/after 2026-10-30 -> REGRESSION","added":T})
# narrow grant
b['narrow_grants'].append({"round":222,"decision":"D-29z238","path":"app/components/studio/ExportDialog.tsx","scope":"stem-selection state logic only (selectedStems init + sync to the stem-ID set, optional pure helper in-file); no JSX/class/copy/handler changes; 10 pre-existing Biome a11y warnings stay","justification":"B-R220-LEGACY-EXPORT-NO-STEMS (Medium); start sha b-round-221-r222-granted-start-sha256.txt"})
b['narrow_grants'].append({"round":222,"decision":"D-29z238","path":"app/lib/__tests__/legacy-export-dialog-stems.test.tsx, docs/implementation/2026/quarter-IV/174-legacy-export-dialog-stem-selection.md","scope":"new files","justification":"ES1-ES7 rows; doc 174 (app/components/studio/__tests__ would fall under the forbidden glob)"})
# findings
of=b['open_findings']
def get(i):
    for f in of:
        if f.get('id')==i: return f
for f in of:
    if f.get('id')=='B-R220-LEGACY-EXPORT-NO-STEMS':
        f['status']='dispatched round 222 (D-29z237: contract = selection follows the stem-ID set; same-ID rebuilds and close/reopen keep toggles); closes on C PASS of LEGACY-UI-STUBBED-222 (10/10) + SUBSET-AUDIO-222 + PERSIST-222 | '+f['status']
        f['round_221_evidence']='c-round-221/legacy/{Low,Medium,High}-1440x900-dialog-initial.png, High-1280x720-dialog-initial.png (0/10, 4/4 runs)'
    if f.get('id')=='GATE220-S1':
        f['status']='closed (D-29z239): C round 221 LEGACY-UI-STUBBED-221 PASS 4/4 runs (168 frames at 128/192/320 kbps, 0 page errors); ownership half stays backend-only (LEGACY-OWNERSHIP) | '+f['status']
    if f.get('id')=='VITE-EXCLUDE-STALE':
        f['gate_221']='gate 221 review suggestion 1 repeats it (Low); still with root (b-round-220-root-request-vite.md); vite.config.ts byte-identical to HEAD at C round 221'
    if f.get('id')=='GATE220-S3':
        f['gate_221']='gate 221 review suggestion 2 repeats it and rates it Medium for agent tooling (primitive/skill would re-introduce @ffmpeg; TL8/TL9 would catch it after the edit); still awaiting_user (Saba): agents cannot edit .claude/.codex/CLAUDE.md/AGENTS.md; re-raised in b-round-221.md section 8'
of.append({"id":"C-R221-01","severity":"low","origin":"C round 221","title":"empty node_modules/@ffmpeg/ directory left by root's npm uninstall; DEPS-221 literal wording 'no node_modules/@ffmpeg directory' not met, intent met (npm ls empty, require.resolve MODULE_NOT_FOUND, 0 lock entries)","status":"closed (D-29z239): environment artifact, gitignored, fresh npm ci does not create it; criterion meaning = no installed @ffmpeg package; optional root rmdir","evidence":"c-round-221/deps.txt, c-round-221/an/cited-and-cache.txt","added":T})
dl=b['deferred_low_polish']
dl.append({"id":"A-R221-REVIEW-L1","also":"GATE221-S5","severity":"low","status":"deferred_low_polish","title":"stale non-ffmpeg facts in docs: docs/learning/README.md l.32/35/39 React v19 (package.json ^18.3.1), Firebase v10 (^12.6.0); docs/technical/studio.md l.22 'Remix (Shopify Hydrogen)' (not a dependency)","source":"a-round-221.md Code review L1; gates/round-221/review.md suggestion 5","repro":"grep -n 'React v19\\|Firebase v10\\|Hydrogen' docs/learning/README.md docs/technical/studio.md","added":T})
dl.append({"id":"GATE221-S3","severity":"low","status":"deferred_low_polish","title":"third-party-licenses.test.ts: new readObjectKeys (l.34) overlaps listDependencyNames (l.56); rebuild the latter on the former","source":"gates/round-221/review.md suggestion 3","repro":"read app/lib/__tests__/third-party-licenses.test.ts l.30-70","added":T})
dl.append({"id":"GATE221-S4","severity":"low","status":"deferred_low_polish","title":"docs/technical/studio.md footer: Last Updated 2026-10-28 but Version 1.1.0 not bumped","source":"gates/round-221/review.md suggestion 4","repro":"tail docs/technical/studio.md","added":T})
dl.append({"id":"LEGACY-EXPORTDIALOG-A11Y-WARNINGS","severity":"low","status":"deferred_low_polish","title":"app/components/studio/ExportDialog.tsx: 10 pre-existing Biome a11y warnings (useButtonType x6, noLabelWithoutControl x4, l.141-263); outside the round-222 narrow grant","source":"B round 221 -> 222 planning (biome check on HEAD 6dd45a1)","repro":"npx biome check app/components/studio/ExportDialog.tsx","added":T})
# harness rule
for h in b['harness_rules']:
    if h.get('id')=='HR-MP3-WARMUP':
        h['amended_round_222']='before the first measured /studio/:productId row (HR-LEGACY-STUBBED) load the purchased route once as a throwaway; one invalid replacement per row for a cold-load timeout (>180 s seen at C round 221) is not a finding (D-29z241)'
# queue
q=b['post_current_stage_queue'][3]
q['status']='in_progress: PERF-16 complete (16b-ii round 221 C PASS, published 6dd45a1; D-29z239); round 222 = B-R220-LEGACY-EXPORT-NO-STEMS (Medium, D-29z237); export-pipeline checkpoint requested (b-round-221-checkpoint-request.md, D-29z240, non-blocking); then PERF-HARNESS-SHARED-LIB (REGRESSION first if due on/after 2026-10-30), execution_order_d29z215 | '+q['status']
for s in q['stages']:
    if s['id']=='PERF-16':
        s['status']='done (16a round 218 da5ad69; 16b-i round 220 c4e6c9d; 16b-ii round 221 6dd45a1; all C PASS browserVerified=true) | '+s['status']
q['consults_round_222']={"advisor":"adopted: narrow grant + ruled test location; contract keyed on the stem-ID set (mute/solo/volume rebuild same ids); prescribed StudioContext mock + L27; honest Reference ('not stated' for default/persistence); measurable browser rows (RMS vs round 221, subset spectral); purchased-route warm-up; export-pipeline checkpoint request; rulings C-R221-01, GATE221-S1..S5, GATE220-S1","project_subagents":"none consulted: one-component state bug with a fixed contract; no UI, copy or interaction change (Ableton reference checked directly in the Live 12 manual)"}
# checkpoint
b['architecture_checkpoint_requests'].append({"id":"ARCH-CHECKPOINT-EXPORT-PIPELINE","request":"b-round-221-checkpoint-request.md","question":"after PERF-16: neutral encoder module + per-call cancel (ARCH-R218-ENCODER-CANCEL-SCOPE, ARCH-R220-ENCODER-NEUTRAL-MODULE, gate-220 S2); one WAV path (worker vs legacy main-thread); legacy facade lifetime vs SRW-21","blocking":False,"status":"requested from root (D-29z240)","added":T})
for s in b['architecture_signals']:
    if s.get('id') in ('ARCH-R218-ENCODER-CANCEL-SCOPE','ARCH-R220-ENCODER-NEUTRAL-MODULE'):
        s['next_round_222']='filed in b-round-221-checkpoint-request.md (D-29z240); not scheduled'
# regression
rr=b['regression_rounds'][-1]
sa=rr['scope_additions']
for i,x in enumerate(sa):
    if x.startswith('PERF-16b-ii (round 221'):
        sa[i]='PERF-16b-ii (round 221, done 6dd45a1): DEPS (no installed @ffmpeg package: npm ls empty, require.resolve fails; an empty scope dir is not a finding, D-29z239) + LEGACY-UI-STUBBED one MP3 export at High through /studio/middle-east (HR-LEGACY-STUBBED)'
sa.append('B-R220-LEGACY-EXPORT-NO-STEMS (round 222, if done): LEGACY-UI-STUBBED initial checked count 10/10 with Export Audio enabled without Select All, both viewports; one deselect -> close -> reopen = 9/10 (added round 222 planning)')
# decisions
D=[("D-29z237","Round 222 = B-R220-LEGACY-EXPORT-NO-STEMS per the round-221 outcome table (C PASS, planning 2026-10-28 < 2026-10-30). Contract: selection = every current stem when the stem-ID SET changes; same-ID rebuilds (mute/solo/volume/trim/loading), order-only changes and close/reopen keep the user's toggles; removed ids leave the selection. Rejected: reset on every open (discards deliberate deselection), useEffect on state.stems identity (wipes toggles on mute), key prop in the protected route."),
("D-29z238","Ownership: narrow grant on app/components/studio/ExportDialog.tsx (selection state only; precedent D-29z166); new test at app/lib/__tests__/legacy-export-dialog-stems.test.tsx (studio/__tests__ would be under the forbidden glob); doc 174. Frozen 1069 = tracked - 1 grant - 3 root-owned (package*.json, vite.config.ts must equal HEAD). B scratch: sketch ES1/ES5 red on the start copy, ES3 green; a render-time id-key fix makes them green, tsc 0 (b-round-221/scratch-run.txt). No jest-dom in the repo."),
("D-29z239","Round 221 closed: C PASS 13 rows, browserVerified/realVerified true; gate 221 published 6dd45a1. PERF-16 complete. C-R221-01 closed as an environment artifact (criterion = no installed @ffmpeg package). GATE220-S1 closed by LEGACY-UI-STUBBED-221. Gate-221 review: S1 -> VITE-EXCLUDE-STALE (root), S2 -> GATE220-S3 (awaiting Saba, gate rates it Medium for agent tooling), S3/S4/S5(+A-R221-REVIEW-L1) -> deferred_low_polish (345)."),
("D-29z240","Export-pipeline architecture checkpoint requested from root at the PERF-16 boundary (b-round-221-checkpoint-request.md): neutral encoder + per-call cancel, one WAV path, legacy facade lifetime vs SRW-21. Non-blocking."),
("D-29z241","HR-MP3-WARMUP amended: throwaway load of /studio/:productId before the first measured HR-LEGACY-STUBBED row; one invalid replacement per row for a cold-load timeout."),
("D-29z242","Reference for round 222: Live 12 manual 5.1.3.1 Selection Options (Rendered Track: Main / All Individual / Selected Tracks Only / single track; Main 'most users will choose'); default selection and remembered settings NOT stated (whole page checked) -> recorded as unconfirmed, never claimed. CZABA in-dialog subset choice recorded as better than Live's pre-dialog selection.")]
for i,t in D: b['decisions_log_b'].append({"id":i,"date":"2026-10-28","text":t})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',len(b['deferred_low_polish']))
