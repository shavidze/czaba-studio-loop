# usage: python3 -I run-mutants.py <scratch> <outdir>   B round 492 planning: jsdom mutants of the sketch
import subprocess, sys, re, shutil, pathlib
S = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
F = S / 'app/routes/account.tsx'
TESTS = ['app/lib/__tests__/account-password-dialog.test.tsx', 'app/lib/__tests__/account-profile-name.test.tsx']
M = {
 'MA_no_close_guard': ("    if (!passwordModalOpenRef.current) {\n      return;\n    }\n    passwordModalOpenRef.current = false;", "    passwordModalOpenRef.current = false;"),
 'MB_no_focus_return': ("    passwordTriggerRef.current?.focus();\n", ""),
 'MC_no_initial_focus': ("      currentPasswordRef.current?.focus();\n", ""),
 'MD_no_presence_gate': ("    if (!isPresent) {\n      return;\n    }\n    const handleKeyDown", "    const handleKeyDown"),
 'ME_no_role_dialog': ('        role="dialog"\n', ''),
 'MF_no_aria_modal': ('        aria-modal="true"\n', ''),
 'MG_no_label_for_new': ('<label htmlFor={newPasswordId} ', '<label '),
 'MH_no_escape': ("      if (e.key === 'Escape') {\n        if (e.isComposing) {\n          return;\n        }\n        e.preventDefault();\n        onClose();\n        return;\n      }\n", ''),
 'MI_no_wrap_forward': ("      } else if (!e.shiftKey && (!inside || active === last)) {", "      } else if (!e.shiftKey && !inside) {"),
 'MJ_no_outside_branch': ("      if (e.shiftKey && (!inside || active === first)) {", "      if (e.shiftKey && active === first) {"),
 'MK_no_modal_ref_in_name_guard': ("    if (passwordModalOpenRef.current) {\n      return false;\n    }\n    const active = document.activeElement;", "    const active = document.activeElement;"),
 'ML_no_eye_label_current': ("                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}\n", ''),
 'MM_no_disabled_filter': ("(el instanceof HTMLInputElement || el instanceof HTMLButtonElement) && !el.disabled", "el instanceof HTMLInputElement || el instanceof HTMLButtonElement"),
 'MN_no_labelledby': ('        aria-labelledby={titleId}\n', ''),
 'MO_no_inert_on_exit': ("      dialogRef.current.inert = !isPresent;\n", ''),
 'MP_no_alert_role': ('              role="alert"\n', ''),
 'MQ_no_composing_guard': ("        if (e.isComposing) {\n          return;\n        }\n", ''),
 'MR_inert_never_cleared': ("      dialogRef.current.inert = !isPresent;\n", "      if (!isPresent) {\n        dialogRef.current.inert = true;\n      }\n"),
 'MS_inside_by_contains': ("      const inside = tabbable.some((el) => el === active);", "      const inside = active instanceof Node && dialog.contains(active);"),
 'MT_focus_once_on_mount': ("  }, [isPresent]);\n\n  useEffect(() => {\n    if (!isPresent) {", "    // eslint\n  }, []);\n\n  useEffect(() => {\n    if (!isPresent) {"),
}
orig = F.read_text()
summary = []
def run(tag):
    r = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=S, capture_output=True, text=True)
    txt = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    (OUT / f'mutant-{tag}.log').write_text(txt)
    red = sorted(set(re.findall(r'× (P[DN][0-9]+[a-z]?)', txt)))
    tot = re.search(r'Tests\s+(.*)', txt)
    return r.returncode, red, tot.group(1).strip() if tot else '?'
rc, red, tot = run('M0')
summary.append(f'M0 rc={rc} red={red} {tot}')
for k, (a, b) in M.items():
    if orig.count(a) != 1:
        summary.append(f'{k} NOT-APPLIED count={orig.count(a)}'); continue
    F.write_text(orig.replace(a, b))
    try:
        rc, red, tot = run(k)
    finally:
        F.write_text(orig)
    summary.append(f"{k} {'RED' if rc else 'SURVIVED'} red={red} {tot}")
(OUT / 'mutants-summary.txt').write_text('\n'.join(summary) + '\n')
print('\n'.join(summary))
