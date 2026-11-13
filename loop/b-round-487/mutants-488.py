# usage: python3 -I mutants-488.py <outdir> [<sketch-488-applied scratch, default /tmp/b488-scratch>]  (mutates a copy in /tmp/b488-mut; refuses store/)
import os, subprocess, sys, shutil, re
OUT = sys.argv[1]; SRC = sys.argv[2] if len(sys.argv) > 2 else '/tmp/b488-scratch'; MUT = '/tmp/b488-mut'
for x in (SRC, MUT, OUT):
    if os.path.realpath(x).startswith('/home/runner/czaba-project/store'): sys.exit('refuse store')
F = 'app/routes/account.tsx'; T = 'app/lib/__tests__/account-profile-name.test.tsx'
HERE = os.path.dirname(os.path.abspath(__file__))
HEADF = os.path.join(HERE, '..', 'b-round-486', 'head-account.tsx')
R487F = os.path.join(HERE, '..', 'b-round-486', 'sketch-487', 'app', 'routes', 'account.tsx')
V1F = os.path.join(HERE, 'sketch-488-v1', 'app', 'routes', 'account.tsx')
M = {
 'M0-HEAD-FILE': 'HEAD',
 'M00-ROUND-487-SKETCH-FILE': 'R487',
 'M000-SKETCH-488-V1-FILE': 'V1',
 'M1-NO-RESTORE-ON-CANCEL': ('  const handleNameCancel = () => {\n    restoreNameFocusRef.current = true;\n', '  const handleNameCancel = () => {\n'),
 'M2-NO-RESTORE-ON-SAVE': ("      restoreNameFocusRef.current = isNameEditorFocusUnclaimed();\n", ''),
 'M3-NO-REPEAT-GUARD-INPUT': ('    if (preventRepeatedEnterKeyDown(e)) {\n      return;\n    }\n', ''),
 'M4-NO-INFLIGHT-GUARD': ('    if (nameSaveInFlightRef.current) {\n      return;\n    }\n', ''),
 'M5-NO-FOCUS-ON-VALIDATION': ("      showToast('First name is required', 'error');\n      nameInputRef.current?.focus();\n", "      showToast('First name is required', 'error');\n"),
 'M6-NO-FOCUS-ON-API-FAIL': ("      if (isNameEditorFocusUnclaimed()) {\n        nameInputRef.current?.focus();\n      }\n", ''),
 'M7-NO-LABELLEDBY': ('            aria-labelledby={`${nameLabelId} ${nameValueId}`}\n', ''),
 'M8-NO-INPUT-LABELS': ('              aria-label="First name"\n', ''),
 'M9-NO-TRIGGER-REPEAT-GUARD': ('            onKeyDown={preventRepeatedEnterKeyDown}\n', ''),
 'M10-INFLIGHT-NOT-RESET': ('    } finally {\n      nameSaveInFlightRef.current = false;\n', '    } finally {\n'),
 'M11-NO-TYPE-BUTTON': ('            id={nameValueId}\n            type="button"\n', '            id={nameValueId}\n'),
 'M12-NO-SAVE-LABEL': ('              aria-label="Save name"\n', ''),
 'M13-ESCAPE-DURING-SAVE': ("    } else if (e.key === 'Escape' && !nameSaveInFlightRef.current) {\n", "    } else if (e.key === 'Escape') {\n"),
 'M14-SUCCESS-GUARD-OFF': ("      restoreNameFocusRef.current = isNameEditorFocusUnclaimed();\n", "      restoreNameFocusRef.current = true;\n"),
 'M15-FAILURE-GUARD-OFF': ("      if (isNameEditorFocusUnclaimed()) {\n        nameInputRef.current?.focus();\n      }\n", "      nameInputRef.current?.focus();\n"),
 'M16-GUARD-ALWAYS-FALSE': ("    if (active === null || active === document.body) {\n      return true;\n    }\n    return nameEditorRef.current?.contains(active) ?? false;\n", "    return active === null && false;\n"),
 'M17-BODY-NOT-UNCLAIMED': ("    if (active === null || active === document.body) {\n", "    if (active === null) {\n"),
 'M19-NO-MODAL-GUARD': ('    if (passwordModalOpenRef.current) {\n      return false;\n    }\n', ''),
 'M20-MODAL-REF-NOT-RESET': ('    passwordModalOpenRef.current = false;\n', ''),
 'M21-MODAL-REF-NOT-SET': ('    passwordModalOpenRef.current = true;\n', ''),
 'M18-NO-EDITOR-ROW-REF': ('<div ref={nameEditorRef} className="flex items-center gap-3">', '<div className="flex items-center gap-3">'),
}
os.makedirs(OUT, exist_ok=True); summary = []
for name, rep in M.items():
    if os.path.exists(MUT): shutil.rmtree(MUT)
    os.makedirs(MUT)
    shutil.copytree(os.path.join(SRC, 'app'), os.path.join(MUT, 'app'))
    for f in os.listdir(SRC):
        p = os.path.join(SRC, f)
        if os.path.isfile(p): shutil.copy(p, MUT)
    os.symlink('/home/runner/czaba-project/store/node_modules', os.path.join(MUT, 'node_modules'))
    fp = os.path.join(MUT, F); s = open(fp).read()
    if rep == 'HEAD': s = open(HEADF).read()
    elif rep == 'R487': s = open(R487F).read()
    elif rep == 'V1': s = open(V1F).read()
    else:
        assert s.count(rep[0]) == 1, name; s = s.replace(rep[0], rep[1], 1)
    open(fp, 'w').write(s)
    r = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=MUT, capture_output=True, text=True)
    log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr); open(os.path.join(OUT, f'mutant-{name}.log'), 'w').write(log)
    red = sorted(set(re.findall(r'^\s*×\s.*?> (PN\d+[a-z]?) ', log, re.M)))
    summary.append(f'{name} rc={r.returncode} red={",".join(red) or "NONE"}')
    print(summary[-1], flush=True)
shutil.rmtree(MUT)
open(os.path.join(OUT, 'mutants-summary.txt'), 'w').write('\n'.join(summary) + '\n')
