import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; B=f'{L}/b-round-506'
if os.path.exists(f'{B}/update-backlog-507b.done'): sys.exit('already applied')
p=f'{L}/backlog.json'; b=json.load(open(p))
assert b['version']==509, b['version']
b['version']=510
WHO='2026-11-14 B round 506 -> 507 planning (closing check)'
d=("Closing check after the advisor review. (1) L47/L50 on Close: Close unmounts the focused element. B's behaviour probe (Enter on a focused Close) reads document.activeElement BODY at HEAD and on the sketch at 1440/1280/375 (probe/head|sketch/behaviour.json activeAfterClose; claim K18). This is pre-existing and not changed by round 507 -> new deferred Low B-R507-PLAYER-CLOSE-FOCUS-LOST (precedent B-R492-PASSWORD-SUBMIT-FOCUS-LOST Low). Its natural target, the Play preview trigger, needs a trigger ref that lives in protected AudioContext.tsx. C6 records it as a named record row. "
   "L50 regex over AudioPlayer.tsx: 4 hits (l.62 Loading output, l.63 error alert, l.104 loading/play ternary, l.167 volume icon ternary), all unchanged code; no focus call (claim K17). "
   "(2) The Close ring is clipped on the right: the box right edge equals the viewport width at HEAD (1406+34) and on the sketch (1408+32), so the 2px-offset ring's right side is off-screen (probe/close-ring-columns.txt: sketch brass columns 9..43 of a 44px crop). This is pre-existing -> deferred Low B-R507-PLAYER-CLOSE-RING-CLIPPED; C3's clause records it instead of asserting 'not clipped' for Close. "
   "(3) 'SSR loaders cannot be page.route-stubbed' holds for the first document request only; stubbing a client-side navigation's loader data request is NOT TRIED. D-29z1830, the consult rulings and ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE are amended to say so; B tries it at round-508 planning (L36) before relying on root. "
   "(4) The Saba info block now lists D2 (transport icons muted at rest) and D3 (Close no longer red on hover, 34 -> 32 px).")
assert not any(x['id']=='D-29z1832' for x in b['decisions_log_b'])
b['decisions_log_b'].append({'id':'D-29z1832','date':'2026-11-14','by':WHO,'decision':d})
for i,t,e in (('B-R507-PLAYER-CLOSE-FOCUS-LOST','Global audio player: keyboard Enter on "Close player" unmounts the player and focus falls to BODY (pre-existing; WCAG 2.4.3); target = the Play preview trigger (needs a trigger ref, AudioContext is protected)','b-round-506/probe/head/behaviour.json and probe/sketch/behaviour.json activeAfterClose (BODY at 1440/1280/375)'),
              ('B-R507-PLAYER-CLOSE-RING-CLIPPED','Global audio player: the Close button sits flush with the viewport right edge (right-0), so its 2px-offset focus ring loses its right side (pre-existing at HEAD 34px and after round 507 32px); fix e.g. right-1','b-round-506/probe/close-ring-columns.txt; probe/*/layout.json close boxes')):
    assert not any(x.get('id')==i for x in b['deferred_low_polish'])
    b['deferred_low_polish'].append({'id':i,'severity':'low','origin':'B pre-check','status':'deferred_low_polish (D-29z1832): pre-existing, unchanged by round 507','title':t,'evidence':e,'added':WHO})
x=[r for r in b['root_requests_b'] if r['id']=='ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE'][0]
x['request']=x['request'].replace('SSR loaders cannot be page.route-stubbed.','The first document SSR request cannot be page.route-stubbed; stubbing a client-side navigation data request is not tried yet (B tries it at round-508 planning, D-29z1832).')
x['status']='open (D-29z1832: may be unnecessary if the client-navigation stub works)'
open(p,'w').write(json.dumps(b,ensure_ascii=True,indent=2))
open(f'{B}/update-backlog-507b.done','w').write('ok'); print('ok',b['version'])
