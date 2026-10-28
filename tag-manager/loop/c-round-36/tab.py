import json,sys,statistics as st
L=sys.argv[1]
def load(n): return json.load(open(f"{L}/{n}.json"))
runs={k:load(k) for k in ["before-run1","before-run2","after-run1","after-run2"]}
def per(d):
  out={}
  for f in d["testResults"]:
    n=f["name"].split("tests/renderer/")[1]
    a=f["assertionResults"]
    out[n]=(sum((x.get("duration") or 0) for x in a),len(a),max(((x.get("duration") or 0),x["title"]) for x in a))
  return out
P={k:per(v) for k,v in runs.items()}
files=sorted(n for n in P["after-run1"] if n.startswith("components/"))
print("| file | before r1/r2 ms | after r1/r2 ms | speedup (mean) | slowest test after r1/r2 ms |")
print("|---|---|---|---|---|")
for n in files:
  b=[P[k][n][0] for k in ["before-run1","before-run2"]]; a=[P[k][n][0] for k in ["after-run1","after-run2"]]
  print(f"| {n} | {b[0]:.0f} / {b[1]:.0f} | {a[0]:.0f} / {a[1]:.0f} | {st.mean(b)/st.mean(a):.1f}x | {P['after-run1'][n][2][0]:.0f} / {P['after-run2'][n][2][0]:.0f} |")
for k in ["after-run1","after-run2"]:
  allt=[((x.get("duration") or 0),f["name"].split("tests/renderer/")[1],x["title"][:60]) for f in runs[k]["testResults"] for x in f["assertionResults"]]
  print(k,"max overall",max(allt)); print(k,"tests>=1500ms",[t for t in allt if t[0]>=1500])
  print(k,"files",len(runs[k]["testResults"]),"passed",runs[k]["numPassedTests"],"failed",runs[k]["numFailedTests"])
  for f in runs[k]["testResults"]:
    if "done-busy" in f["name"]:
      print(k,"done-busy",[(x["title"][:4],round(x.get("duration") or 0),x["status"]) for x in f["assertionResults"]])
