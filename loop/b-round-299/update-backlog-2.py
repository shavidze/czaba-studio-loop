import json
P='backlog.json'
b=json.load(open(P))
ADDED='2026-10-31 B round 299 -> 300 planning'
assert b['decisions_log_b'][-1]['id']=='D-29z772'
b['decisions_log_b'].append({'id':'D-29z773','date':'2026-10-31','text':"(1) SABA-Q-STUDIO-LINK-B (L44, awaiting_user, non-blocking): unmapped library sources keep the browser's native menu instead of a Studio menu; a right-click selects the source and moves an active preview to it like a left click. (2) B-R299-IM24-LOAD-SIGNAL: insert-marker-ui IM24 (playing-state status text) failed once in B's final sketch covering run while B's :5300 dev server and Playwright probes ran concurrently; it passed in B's first run, 3/3 alone on the sketch and in gate 299 verify. Signal only; round 300 tells A to run the covering set alone (L38) and to treat a failure alone as a STOP. (3) No lesson change: no new failure class this round; lessons.md stays 59 lines."})
# (an earlier draft created a top-level awaiting_user list; the entry was moved into open_findings next to SABA-Q-STUDIO-LINK)
entry={'id':'SABA-Q-STUDIO-LINK-B','status':'awaiting_user (D-29z773)','question':"1) Unmapped library sources show the browser's native menu instead of a Studio menu. Keep? 2) A right-click on a library source selects it and moves an active preview to it, like a left click. Keep?",'origin':'B round 300 planning (L44 deliberate differences from Live)','added':ADDED}
if isinstance(b.get('awaiting_user'),list): b['awaiting_user'].append(entry)
else: b['open_findings'].append(dict(entry,severity='info'))
b['open_findings'].append({'id':'B-R299-IM24-LOAD-SIGNAL','severity':'info','origin':'B round 300 planning (sketch covering run under concurrent load)','title':'insert-marker-ui IM24 failed once under concurrent dev-server + Playwright load; passes alone 3/3 and in gate 299','status':'signal (D-29z773): watch; a failure in a run alone is a STOP','evidence':'b-round-299/sketch-covering-run-final.log; b-round-299/im24-sketch-alone.txt','added':ADDED})
b['version']=b['version']+1
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok',b['version'],'awaiting_user list' if isinstance(b.get('awaiting_user'),list) else 'in open_findings')
