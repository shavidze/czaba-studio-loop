import json,sys
env=json.load(open('../env-status.json'))
R=json.load(open('rows.json'))
J={"taskStatus":R["taskStatus"],"passed":R["passed"],"failed":R.get("failed",[]),"inconclusive":R.get("inconclusive",[]),
"blocked":R["blocked"],"carried":R["carried"],"gate":R["gate"],"notRun":R["notRun"],"bugs":R["bugs"],"observations":R["observations"],
"invalidRuns":R["invalidRuns"],"lookups":R["lookups"],"browserVerified":R["browserVerified"],"realVerified":R["browserVerified"],
"envStatus":env,"stopSignal":R.get("stopSignal"),"progressFile":"c-round-425/progress.json"}
J.update(R["l57"])
json.dump(J,open('../c-round-425.json','w'),indent=1)
md=["# C round 425 — REGRESSION-2026-11-10 part 2 (HEAD f6c76f4, A changed nothing)\n",R["summary"],"\n","| Row | Result | Evidence |","|---|---|---|"]
for r in R["table"]: md.append("| %s | %s | %s |"%tuple(r))
md.append("\n## Bugs\n"+"\n".join("- **%s** (%s): %s"%(b["id"],b["severity"],b["actual"]) for b in R["bugs"]) if R["bugs"] else "\n## Bugs\nnone")
for k,t in [("observations","Observations"),("lookups","Lookups"),("invalidRuns","Invalid runs"),("notRun","Not run"),("blocked","Blocked"),("carried","Carried"),("gate","Gate rows (not claimed)")]:
    md.append("\n## "+t); md+=["- "+str(x) for x in R[k]]
md.append("\n## Next steps for B\n"+"\n".join("- "+x for x in R["next"]))
open('../c-round-425.md','w').write("\n".join(md)+"\n")
print('written',len(R["table"]),'rows')
