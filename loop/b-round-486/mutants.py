# usage: python3 -I mutants.py <outdir> [<sketch-applied scratch, default /tmp/b487-scratch>]  (mutates a copy in /tmp/b487-mut; refuses store/)
import os, subprocess, sys, shutil, re
OUT = sys.argv[1]; SRC = sys.argv[2] if len(sys.argv) > 2 else '/tmp/b487-scratch'; MUT = '/tmp/b487-mut'
for x in (SRC, MUT, OUT):
    if os.path.realpath(x).startswith('/home/runner/czaba-project/store'): sys.exit('refuse store')
F = 'app/routes/account.tsx'; T = 'app/lib/__tests__/account-profile-name.test.tsx'
HEADF = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'head-account.tsx')
M = {
 'M0-HEAD-FILE': None,
 'M1-NO-RESTORE-ON-CANCEL': ('  const handleNameCancel = () => {\n    restoreNameFocusRef.current = true;\n', '  const handleNameCancel = () => {\n'),
 'M2-NO-RESTORE-ON-SAVE': ("      showToast('Name updated', 'success');\n      restoreNameFocusRef.current = true;\n", "      showToast('Name updated', 'success');\n"),
 'M3-NO-REPEAT-GUARD-INPUT': ('    if (preventRepeatedEnterKeyDown(e)) {\n      return;\n    }\n', ''),
 'M4-NO-INFLIGHT-GUARD': ('    if (nameSaveInFlightRef.current) {\n      return;\n    }\n', ''),
 'M5-NO-FOCUS-ON-VALIDATION': ("      showToast('First name is required', 'error');\n      nameInputRef.current?.focus();\n", "      showToast('First name is required', 'error');\n"),
 'M6-NO-FOCUS-ON-API-FAIL': ("'Failed to update name', 'error');\n      nameInputRef.current?.focus();\n", "'Failed to update name', 'error');\n"),
 'M7-NO-LABELLEDBY': ('            aria-labelledby={`${nameLabelId} ${nameValueId}`}\n', ''),
 'M8-NO-INPUT-LABELS': ('              aria-label="First name"\n', ''),
 'M9-NO-TRIGGER-REPEAT-GUARD': ('            onKeyDown={preventRepeatedEnterKeyDown}\n', ''),
 'M10-INFLIGHT-NOT-RESET': ('    } finally {\n      nameSaveInFlightRef.current = false;\n', '    } finally {\n'),
 'M11-NO-TYPE-BUTTON': ('            id={nameValueId}\n            type="button"\n', '            id={nameValueId}\n'),
 'M13-ESCAPE-DURING-SAVE': ("    } else if (e.key === 'Escape' && !nameSaveInFlightRef.current) {\n", "    } else if (e.key === 'Escape') {\n"),
 'M12-NO-SAVE-LABEL': ('              aria-label="Save name"\n', ''),
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
    if name == 'M0-HEAD-FILE': s = open(HEADF).read()
    else:
        assert s.count(rep[0]) == 1, name; s = s.replace(rep[0], rep[1], 1)
    open(fp, 'w').write(s)
    r = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=MUT, capture_output=True, text=True)
    log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr); open(os.path.join(OUT, f'mutant-{name}.log'), 'w').write(log)
    red = sorted(set(re.findall(r'^\s*×\s.*?> (PN\d+b?) ', log, re.M)))
    summary.append(f'{name} rc={r.returncode} red={",".join(red) or "NONE"}')
    print(summary[-1], flush=True)
shutil.rmtree(MUT)
open(os.path.join(OUT, 'mutants-summary.txt'), 'w').write('\n'.join(summary) + '\n')
