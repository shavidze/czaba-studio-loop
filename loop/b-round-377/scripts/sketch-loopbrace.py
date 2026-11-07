import sys
root=sys.argv[1]
p=root+'/app/components/arrangement/ArrangementLoopBrace.tsx'
s=open(p).read()
def rep(old,new,count=1):
    global s
    assert s.count(old)==count,(old,s.count(old))
    s=s.replace(old,new)
rep("import { type KeyboardEvent, type PointerEvent, useEffect, useRef } from 'react';\nimport { formatArrangementTime, useArrangement } from '~/contexts/ArrangementContext';",
    "import { type KeyboardEvent, memo, type PointerEvent, useEffect, useMemo, useRef } from 'react';\nimport {\n  type ArrangementContextValue,\n  formatArrangementTime,\n  useArrangement,\n} from '~/contexts/ArrangementContext';")
rep("""interface ArrangementLoopBraceProps {
  seconds: number;
  pxPerSecond: number;
  snapSeconds?: number | null;
  gridSeconds?: number;
}
""","""interface ArrangementLoopBraceProps {
  seconds: number;
  pxPerSecond: number;
  snapSeconds?: number | null;
  gridSeconds?: number;
}

export type ArrangementLoopBraceActions = Pick<
  ArrangementContextValue,
  | 'getArrangement'
  | 'previewLoopArrangement'
  | 'commitLoopRange'
  | 'stepLoopRange'
  | 'claimPointerGesture'
>;

interface ArrangementLoopBraceViewProps extends ArrangementLoopBraceProps {
  loop: ArrangementLoop | null;
  actions: ArrangementLoopBraceActions;
}
""")
rep("""export function ArrangementLoopBrace({
  seconds,
  pxPerSecond,
  snapSeconds = null,
  gridSeconds,
}: ArrangementLoopBraceProps) {
  const {
    arrangement,
    getArrangement,
    previewLoopArrangement,
    commitLoopRange,
    stepLoopRange,
    claimPointerGesture,
  } = useArrangement();
  const braceRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<LoopGesture | null>(null);
  const loop = arrangement.loop;
""","""export function useArrangementLoopBraceActions(
  workspace: ArrangementContextValue,
): ArrangementLoopBraceActions {
  const {
    getArrangement,
    previewLoopArrangement,
    commitLoopRange,
    stepLoopRange,
    claimPointerGesture,
  } = workspace;
  return useMemo(
    () => ({
      getArrangement,
      previewLoopArrangement,
      commitLoopRange,
      stepLoopRange,
      claimPointerGesture,
    }),
    [getArrangement, previewLoopArrangement, commitLoopRange, stepLoopRange, claimPointerGesture],
  );
}

export function ArrangementLoopBrace(props: ArrangementLoopBraceProps) {
  const workspace = useArrangement();
  const actions = useArrangementLoopBraceActions(workspace);
  return <ArrangementLoopBraceView {...props} loop={workspace.arrangement.loop} actions={actions} />;
}

function ArrangementLoopBraceViewInner({
  seconds,
  pxPerSecond,
  snapSeconds = null,
  gridSeconds,
  loop,
  actions,
}: ArrangementLoopBraceViewProps) {
  const {
    getArrangement,
    previewLoopArrangement,
    commitLoopRange,
    stepLoopRange,
    claimPointerGesture,
  } = actions;
  const braceRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<LoopGesture | null>(null);
""")
s=s.rstrip('\n')+"\n\nexport const ArrangementLoopBraceView = memo(ArrangementLoopBraceViewInner);\n"
open(p,'w').write(s)

w=root+'/app/components/arrangement/StudioWorkspace.tsx'
t=open(w).read()
def repw(old,new):
    global t
    assert t.count(old)==1,(old,t.count(old))
    t=t.replace(old,new)
repw("import { ArrangementLoopBrace } from './ArrangementLoopBrace';","import { ArrangementLoopBraceView, useArrangementLoopBraceActions } from './ArrangementLoopBrace';")
repw("  const transportActions = useArrangementTransportActions(workspace);\n","  const transportActions = useArrangementTransportActions(workspace);\n  const loopBraceActions = useArrangementLoopBraceActions(workspace);\n")
repw("""                  <ArrangementLoopBrace
                    seconds={timelineSeconds}
                    pxPerSecond={pxPerSecond}
                    snapSeconds={activeSnapSeconds}
                    gridSeconds={snapGridSeconds}
                  />""","""                  <ArrangementLoopBraceView
                    seconds={timelineSeconds}
                    pxPerSecond={pxPerSecond}
                    snapSeconds={activeSnapSeconds}
                    gridSeconds={snapGridSeconds}
                    loop={arrangement.loop}
                    actions={loopBraceActions}
                  />""")
open(w,'w').write(t)
print('ok')
