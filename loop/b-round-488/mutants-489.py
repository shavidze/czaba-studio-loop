# usage: python3 -I mutants-489.py <outdir(abs)> <scratch(abs) = clone at 73f994d with sketch-489 applied>
# Never run from or on store/. Each mutant edits one file in the scratch, runs the entrance test file, records red rows, restores.
import os, re, subprocess, sys, shutil
out, root = sys.argv[1], sys.argv[2]
if os.path.realpath(root).startswith('/home/runner/czaba-project/store'): sys.exit('refuse: scratch is store/')
os.makedirs(out, exist_ok=True)
EC = 'app/components/loading/EntranceCover.tsx'; SL = 'app/components/loading/SpotlightLoader.tsx'
T = 'app/lib/__tests__/store-entrance-loader.test.tsx'
HEAD = {}
for f in (EC, SL):
    HEAD[f] = subprocess.run(['git', '-C', root, 'show', '73f994d:' + f], capture_output=True, text=True, check=True).stdout
M = [
 ('M0-HEAD-SOURCE', None, None, None),
 ('M1-MIN-1450', EC, 'ENTRANCE_MIN_TOTAL_MS = 3500;', 'ENTRANCE_MIN_TOTAL_MS = 1450;'),
 ('M2-FAILSAFE-1000', EC, 'ENTRANCE_FAILSAFE_MS = 2000;', 'ENTRANCE_FAILSAFE_MS = 1000;'),
 ('M3-MAX-4000', EC, 'ENTRANCE_MAX_TOTAL_MS = 5000;', 'ENTRANCE_MAX_TOTAL_MS = 4000;'),
 ('M4-TIMELINE-EXIT-250', SL, '    endInMs: exitInMs + ENTRANCE_OVERLAY_EXIT_MS,', '    endInMs: exitInMs + 250,'),
 ('M5-EXIT-AFTER-1050', EC, 'ENTRANCE_EXIT_AFTER_TAKEOVER_MIN_MS = 2500;', 'ENTRANCE_EXIT_AFTER_TAKEOVER_MIN_MS = 1050;'),
 ('M6-LOGO-120', SL, 'LOGO_AFTER_TAKEOVER_MS = 400;', 'LOGO_AFTER_TAKEOVER_MS = 120;'),
 ('M7-HOLD-300', SL, 'HOLD_AFTER_TAKEOVER_MS = 1100;', 'HOLD_AFTER_TAKEOVER_MS = 300;'),
 ('M8-BOOT-NO-SCROLL-LISTENERS', EC, '${scrollSkipListenerOn}', ''),
 ('M9-BOOT-NO-PREVENT', EC, 'if(e.cancelable)e.preventDefault();e.stopPropagation();}end();', 'e.stopPropagation();}end();'),
 ('M10-BOOT-NO-STOP', EC, 'if(e.cancelable)e.preventDefault();e.stopPropagation();}end();', 'if(e.cancelable)e.preventDefault();}end();'),
 ('M11-BOOT-OFF-KEEPS-SCROLL', EC, '${scrollSkipListenerOff}', ''),
 ('M12-OVERLAY-WHEEL-ONLY', EC, "ENTRANCE_SCROLL_SKIP_EVENTS = ['wheel', 'touchmove'] as const;", "ENTRANCE_SCROLL_SKIP_EVENTS = ['wheel'] as const;"),
 ('M13-OVERLAY-NO-PREVENT', SL, '        if (event.cancelable) event.preventDefault();\n', ''),
 ('M14-OVERLAY-NO-STOP', SL, '        event.stopPropagation();\n      }\n      hideEntrance();', '      }\n      hideEntrance();'),
 ('M15-OVERLAY-NO-HIDE', SL, '        event.stopPropagation();\n      }\n      hideEntrance();', '        event.stopPropagation();\n      }'),
 ('M16-OVERLAY-NO-REMOVE', SL, "        window.removeEventListener(type, handleEntranceSkipScroll, { capture: true });\n", ''),
 ('M17-OVERLAY-REMOVE-BUBBLE', SL, "window.removeEventListener(type, handleEntranceSkipScroll, { capture: true });", "window.removeEventListener(type, handleEntranceSkipScroll);"),
 ('M18-BOOT-CTRL-WHEEL-BLOCKED', EC, 'if(!e.ctrlKey&&!(e.touches&&e.touches.length>1)){', 'if(!(e.touches&&e.touches.length>1)){'),
 ('M19-BOOT-PINCH-BLOCKED', EC, 'if(!e.ctrlKey&&!(e.touches&&e.touches.length>1)){', 'if(!e.ctrlKey){'),
 ('M20-OVERLAY-ZOOM-BLOCKED', SL, '      if (!isZoomGesture(event)) {', '      if (!isZoomGesture(event) || event.cancelable) {'),
 ('M21-BOOT-OFF-BUBBLE-FLAG', EC, "window.removeEventListener('${type}',scroll,true);", "window.removeEventListener('${type}',scroll);"),
]
summary = []
for mid, f, a, b in M:
    saved = {}
    try:
        if mid == 'M0-HEAD-SOURCE':
            for g in (EC, SL):
                saved[g] = open(os.path.join(root, g)).read(); open(os.path.join(root, g), 'w').write(HEAD[g])
        else:
            p = os.path.join(root, f); s = open(p).read(); saved[f] = s
            if s.count(a) != 1: summary.append(f'{mid} BAD-ANCHOR count={s.count(a)}'); continue
            open(p, 'w').write(s.replace(a, b))
        r = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=root, capture_output=True, text=True)
        log = r.stdout + r.stderr
        open(os.path.join(out, f'mutant-{mid}.log'), 'w').write(log)
        plain = re.sub(r'\x1b\[[0-9;]*m', '', log)
        ids = sorted(set(m.split(' > ')[-1].split(' ')[0] for m in re.findall(r'^\s*FAIL\s+(.*)$', plain, re.M)))
        summary.append(f'{mid} rc={r.returncode} red={",".join(ids) if ids else "NONE"}')
    finally:
        for g, s in saved.items(): open(os.path.join(root, g), 'w').write(s)
open(os.path.join(out, 'mutants-summary.txt'), 'w').write('\n'.join(summary) + '\n')
print('\n'.join(summary))
