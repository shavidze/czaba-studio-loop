# b-round-459 v2 (handshake on window). usage: python3 -I mutants.py <scratch store dir> <out file>
# Each mutant: one exact replacement in one file, run the entrance test file, restore the file bytes.
import subprocess, sys, os
S, OUT = sys.argv[1], sys.argv[2]
EC='app/components/loading/EntranceCover.tsx'; SL='app/components/loading/SpotlightLoader.tsx'; RT='app/root.tsx'
M = [
 ('BASE', None, None, None),
 ('M1-no-path-check', EC, "if(!c||location.pathname!=='/')return;", "if(!c)return;"),
 ('M2-no-reduced-motion', EC, "if(window.matchMedia&&window.matchMedia('${ENTRANCE_REDUCED_MOTION_QUERY}').matches)return;", ""),
 ('M3-no-session-gate', EC, "${sessionGate}var h=", "var h="),
 ('M4-no-takeover-off', SL, "  cover.setAttribute('data-state', state);\n  cover.media = 'not all';\n", "  cover.setAttribute('data-state', state);\n"),
 ('M5-no-failsafe-check', SL, "if (Number.isFinite(elapsed) && elapsed < ENTRANCE_FAILSAFE_MS) return handshake.start;", "return handshake.start;"),
 ('M6-no-boot-keydown', EC, "document.addEventListener('keydown',key,true);", ""),
 ('M7-min-1150', EC, "export const ENTRANCE_MIN_TOTAL_MS = 1450;", "export const ENTRANCE_MIN_TOTAL_MS = 1150;"),
 ('M8-no-cap', SL, "    ENTRANCE_MAX_TOTAL_MS - ENTRANCE_EXIT_MS,\n  );", "    Number.POSITIVE_INFINITY,\n  );"),
 ('M9-failsafe-css-3000', EC, "animation:czaba-entrance-failsafe ${ENTRANCE_EXIT_MS}ms ease-in-out ${ENTRANCE_FAILSAFE_MS}ms forwards", "animation:czaba-entrance-failsafe ${ENTRANCE_EXIT_MS}ms ease-in-out 3000ms forwards"),
 ('M10-no-takeover-event', SL, "    window.dispatchEvent(new Event(ENTRANCE_TAKEOVER_EVENT));\n\n    return () => {", "\n    return () => {"),
 ('M11-root-cover-removed', RT, "        <EntranceCoverHead />\n", ""),
 ('M12-no-client-fallback', SL, "  return claimEntranceForSession() ? performance.now() : null;", "  return null;"),
 ('M13-boot-click-removed', EC, "document.addEventListener('click',end,true);", ""),
 ('M14-hold-350', SL, "const HOLD_AFTER_TAKEOVER_MS = 300;", "const HOLD_AFTER_TAKEOVER_MS = 350;"),
 ('M15-cover-default-on', EC, "media={isEntrancePending() ? 'all' : 'not all'}", 'media="all"'),
 ('M16-layout-effect-on-server', SL, ("import { useEffect, useRef, useState } from 'react';", "  useEffect(() => {\n    if (!isVisible || startMs === null) return;"), ("import { useEffect, useLayoutEffect, useRef, useState } from 'react';", "  useLayoutEffect(() => {\n    if (!isVisible || startMs === null) return;")),
 ('M17-retire-any-cover', SL, "  if (cover && cover.media === 'all') {", "  if (cover) {"),
 ('M18-claim-ignores-state', SL, "    if (handshake.state !== 'pending') return null;\n", ""),
 ('M19-pending-skip-ignored', SL, "    if (handshake?.state === 'skipped') {\n      hideEntrance();\n    } else if (handshake?.state === 'pending') {", "    if (handshake?.state === 'pending') {"),
 ('M20-start-from-dom-node', SL, "elapsed < ENTRANCE_FAILSAFE_MS) return handshake.start;", "elapsed < ENTRANCE_FAILSAFE_MS) return Number(findEntranceCover()?.getAttribute('data-start'));"),
 ('M21-boot-skip-on-old-node', EC, "var n=document.getElementById('${ENTRANCE_COVER_ID}');", "var n=c;"),
 ('M22-expired-no-event', SL, "  syncEntranceCover('expired');\n  window.dispatchEvent(new Event(ENTRANCE_TAKEOVER_EVENT));\n}", "  syncEntranceCover('expired');\n}"),
 ('M23-no-boot-self-timeout', EC, "t=setTimeout(off,${ENTRANCE_FAILSAFE_MS + ENTRANCE_EXIT_MS});", ""),
 ('M24-no-live-state', SL, "      handshake.state = 'live';\n", ""),
 ('M25-boot-state-not-on-window', EC, "window.__czabaEntrance=h;", ""),
 ('M27-pending-without-time-bound', EC, "handshake?.state === 'pending' && performance.now() - handshake.start < ENTRANCE_FAILSAFE_MS", "handshake?.state === 'pending'"),
 ('M26-rerender-cover-off', EC, "media={isEntrancePending() ? 'all' : 'not all'}", 'media="not all"'),
]
lines=[]
for mid, f, old, new in M:
    orig=None
    if f:
        p=os.path.join(S,f); orig=open(p,'rb').read(); s=orig.decode()
        pairs = list(zip(old, new)) if isinstance(old, tuple) else [(old, new)]
        if any(s.count(o)!=1 for o,_ in pairs): lines.append(f'{mid} ANCHOR-MISSING'); continue
        for o,n in pairs: s=s.replace(o,n)
        open(p,'w').write(s)
    try:
        r=subprocess.run(['npx','vitest','run','app/lib/__tests__/store-entrance-loader.test.tsx'],cwd=S,capture_output=True,text=True,timeout=300)
        log=r.stdout+r.stderr
        open(os.path.join(os.path.dirname(OUT),f'mutant-{mid}.log'),'w').write(log)
        failed=[l.strip() for l in log.splitlines() if '×' in l]
        lines.append(f"{mid} {'green' if r.returncode==0 else 'RED'} {len(failed)}")
    finally:
        if orig is not None: open(p,'wb').write(orig)
open(OUT,'w').write('\n'.join(lines)+'\n'); print('\n'.join(lines))
