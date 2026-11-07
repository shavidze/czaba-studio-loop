import json
P='backlog.json'
b=json.load(open(P))
assert b['version']==346
WHEN='2026-11-07 B round 379 -> 380 planning'
of=b['open_findings']
of.append({'id':'SABA-Q-PERF12B-TOLERANCE','severity':'question','origin':'tech-lead TL-R380-12B (round-380 sketch review)','title':'may a windowed (PERF-12b) export differ from a one-pass export by at most 1 LSB of 24-bit near 30 s edges, with identical peak and clipped counts? (perf-plan says bit-exact)','evidence':'b-round-379/sketch-review.md section 3; user-review/questions-perf12b.md','status':'awaiting_user (D-29z1266): does not block 12a or other work; 12b is built and measured, its tolerance asserts and publication follow the answer','added':WHEN})
b['architecture_signals'].append({'id':'SIG-R380-WORKER-DOUBLE-BUFFER','origin':'tech-lead review of the round-380 sketch','note':'the WAV worker briefly holds the full WAV ArrayBuffer and the Blob (about 2 x WAV size, worker only); building the Blob from per-chunk parts would halve it. Not in 12a; candidate inside PERF-12b','added':WHEN})
b['decisions_log_b'].append({'id':'D-29z1266','date':'2026-11-07','by':'B round 379 -> 380 planning','decision':'Round-380 sketch rulings: tech-lead fixes adopted in sketch v2 (TL-R380-B1 post-then-report with a throw-safe reporter, TL-R380-L1 empty chunk rejected, TL-R380-L2 wav progress starts at 0); PO-R380-W1 ack window stays 1 (wall-ms not worse than HEAD at 1x/6x); 4 resources rows flip to assert (peak-backing 1x <= 5 MiB, longtask-max.6x <= 100 ms) with perf mutants red on the sketch; browser WAV bytes sketch == HEAD at both viewports (E1-E4; E4 does not clip on either tree). TL-R380-12B: windowed renders cannot be bit-exact; SABA-Q-PERF12B-TOLERANCE recorded (L44) in user-review/questions-perf12b.md'})
json.dump(b,open(P,'w'),ensure_ascii=False,indent=2)
print('ok')
