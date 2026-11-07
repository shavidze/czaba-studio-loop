import sys,re
p=sys.argv[1]+'/app/components/arrangement/ArrangementTransport.tsx'
s=open(p).read()
block_re=re.compile(r"  const focusHandoffRef = useRef<\{\n    source: HTMLButtonElement;\n    partner: HTMLButtonElement \| null;\n  \} \| null>\(null\);\n\n  const armFocusHandoff = .*?\n  \}\);\n", re.S)
blocks=block_re.findall(s); assert len(blocks)==2, len(blocks)
assert blocks[0]==blocks[1]
s=block_re.sub("  const armFocusHandoff = useSoftDisableFocusHandoff();\n", s)
s=s.replace("import { type KeyboardEvent, memo, useCallback, useId, useMemo, useRef } from 'react';",
            "import { type KeyboardEvent, memo, useCallback, useEffect, useId, useMemo, useRef } from 'react';")
hook='''function useSoftDisableFocusHandoff() {
  const handoffRef = useRef<{
    source: HTMLButtonElement;
    partner: HTMLButtonElement | null;
  } | null>(null);
  const expiryFrameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (expiryFrameRef.current !== null) {
        cancelAnimationFrame(expiryFrameRef.current);
        expiryFrameRef.current = null;
      }
    },
    [],
  );

  useIsomorphicLayoutEffect(() => {
    const handoff = handoffRef.current;
    handoffRef.current = null;
    if (
      !handoff ||
      !isSoftDisabledButton(handoff.source) ||
      !handoff.partner ||
      isSoftDisabledButton(handoff.partner)
    ) {
      return;
    }
    const activeElement = document.activeElement;
    if (
      activeElement === handoff.source ||
      activeElement === document.body ||
      activeElement === null
    ) {
      handoff.partner.focus();
    }
  });

  return useCallback((source: HTMLButtonElement, partner: HTMLButtonElement | null) => {
    handoffRef.current = document.activeElement === source ? { source, partner } : null;
    if (expiryFrameRef.current !== null) {
      cancelAnimationFrame(expiryFrameRef.current);
    }
    expiryFrameRef.current = requestAnimationFrame(() => {
      expiryFrameRef.current = null;
      handoffRef.current = null;
    });
  }, []);
}

'''
anchor='export type ArrangementTransportActions = Pick<'
assert s.count(anchor)==1
s=s.replace(anchor, hook+anchor)
open(p,'w').write(s); print('ok')
