import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-507'
if os.path.exists(f'{B}/update-backlog-508b.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==511, b['version']
b['version']=512
WHO='2026-11-14 B round 507 -> 508 planning (sketch review)'
SHA=open(f'{B}/sketch-sha.txt').read().split()[0]
d=("Sketch review of the round-508 delta (b-round-507/sketch-review.md, tech-lead read-only): v1 9fb27de4 left surviving AudioPlayer mutants: R1 extra classes (Medium), R2 icon height (Medium), R3 layout position/order (Medium), R4 Mute threshold (Low), R5 disabled={isLoading} (Low), R6 icon path shapes (Low). "
   f"Delta v2 {SHA[:8]} adds N1-7 (sorted class set equals a rendered ghost IconButton reference plus Close's 4 position classes), N1-4 height, N1-6 at 0.01; mutants M11-M14 added; M0-M14 OK, restored rc0. "
   "R3 is pre-ruled to the browser rows C1 (per-control boxes vs oracle) and C5; R5 and R6 are recorded. Side finding R6: the low- and high-volume icons are identical at HEAD -> deferred Low B-R508-VOLUME-ICON-LOW-SAME. "
   "Re-run on v2: tsc rc0, lint 175, Biome 1 warning, covering 8/88 (slowest LT7 753 ms; L31 limit 2,500 ms = 50 % of the 5 s default, ruled in task #14), full 304/4386 rc0, build rc0; fresh archive + v2 + delta reproduces r508-post-sketch-sha and tree rc0; store pre-sha and git apply --check rc0.")
assert not any(x['id']=='D-29z1836' for x in b['decisions_log_b'])
b['decisions_log_b'].append({'id':'D-29z1836','date':'2026-11-14','by':WHO,'decision':d})
b['deferred_low_polish'].append({'id':'B-R508-VOLUME-ICON-LOW-SAME','severity':'low','origin':'B sketch review (tech-lead)','status':'deferred_low_polish (D-29z1836)',
  'title':'Global AudioPlayer: the volume < 0.5 icon and the >= 0.5 icon draw the same path, so the low-volume branch shows nothing different','evidence':'b-round-507/sketch-review.md R6',
  'repro':'read app/components/audio/AudioPlayer.tsx volume icon branches (low and high svg d paths are identical)','added':WHO})
r=[r for r in b['rounds'] if r.get('round')==508]; assert len(r)==1
r[0]['decision']='D-29z1834/D-29z1836'
r[0]['note']=f'baseline HEAD 3021b30 with v2 applied in the worktree; delta v2 b-round-507/sketch-508-delta.patch.txt sha {SHA[:8]} (v1 9fb27de4 superseded after sketch review); pre-check b-round-507/precheck-*.log; mutants M0-M14 b-round-507/mutants-508.txt; browser oracles b-round-506/probe/sketch (AudioPlayer unchanged)'
b['current_task']=(f"Round 508: DPG-BUTTON-CLEANUP-2-NONBRAND stage N1 re-dispatch. Store tree already has v2; A applies only b-round-507/sketch-508-delta.patch.txt (sha {SHA[:8]}): n1 test N1-2 per-click asserts, N1-4 height, N1-6, N1-7 exact class set; doc 328. "
    "C runs C0-C12 at 1440/1280/375 with real preview audio (C9 = mutants M0-M14)")
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-508b.done','w').write('ok'); print('ok',b['version'])
