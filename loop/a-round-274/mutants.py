import subprocess, shutil, hashlib, sys, re, json
F='app/contexts/ArrangementContext.tsx'
orig=open(F).read(); h=hashlib.sha256(orig.encode()).hexdigest()
G_TEXT="""          setStatus(keyRepeat ? () => text : text);
        }
        return;"""
S_TEXT="""      const text = studioMoveStrings.nudged(formatArrangementTime(moved?.start ?? target));
      setStatus(keyRepeat ? () => text : text);"""
assert orig.count(G_TEXT)==1 and orig.count(S_TEXT)==1
M={
 'M-NO-SINGLE': (S_TEXT, "      const text = studioMoveStrings.nudged(formatArrangementTime(moved?.start ?? target));\n      void text;"),
 'M-NO-GROUP': (G_TEXT, "          void text;\n        }\n        return;"),
 'M-GROUP-ALWAYS-RIGHT': ("            after.start >= before.start\n", "            true\n"),
 'M-SINGLE-PRE-START': ("formatArrangementTime(moved?.start ?? target)", "formatArrangementTime(clip.start)"),
 'M-GROUP-NUDGE-LABEL': ("          )({\n            label,\n", "          )({\n            label: studioMoveStrings.historyNudgeClip,\n"),
 'M-GROUP-REPEAT-STRING': (G_TEXT, "          setStatus(text);\n        }\n        return;"),
 'M-REPEAT-SILENT': (S_TEXT, "      const text = studioMoveStrings.nudged(formatArrangementTime(moved?.start ?? target));\n      if (!keyRepeat) {\n        setStatus(text);\n      }"),
}
res={}
try:
  for k,(a,b) in M.items():
    assert orig.count(a)==1,k
    open(F,'w').write(orig.replace(a,b))
    out=subprocess.run(['npx','vitest','run','app/lib/arrangement/__tests__/status-lifetime.test.tsx','app/lib/arrangement/__tests__/status-announcement-ui.test.tsx','--reporter=json','--outputFile=/tmp/mut.json'],capture_output=True,text=True)
    d=json.load(open('/tmp/mut.json'))
    failed=sorted({a['title'].split(' ')[0] for t in d['testResults'] for a in t['assertionResults'] if a['status']!='passed'})
    res[k]=failed; print(k,failed,flush=True)
finally:
  open(F,'w').write(orig)
assert hashlib.sha256(open(F).read().encode()).hexdigest()==h
print('restored', h)
json.dump(res,open(sys.argv[1],'w'),indent=1)
