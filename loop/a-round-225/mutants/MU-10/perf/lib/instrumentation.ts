export interface PerfFiber {
  tag: number;
  flags: number;
  child: PerfFiber | null;
  sibling: PerfFiber | null;
  alternate: PerfFiber | null;
}

export interface PerfFiberRoot {
  current: PerfFiber;
}

export interface PerfCommitRecord {
  t: number;
  rendered: number;
}

export interface PerfStartRecord {
  t: number;
  task: number;
}

export interface PerfMoveLatency {
  move: number;
  t: number;
  latency: number;
}

export interface PerfTimedEntry {
  t: number;
  duration: number;
  name: string;
}

export interface PerfState {
  commits: PerfCommitRecord[];
  starts: PerfStartRecord[];
  frames: number[];
  moves: number[];
  downs: number[];
  ups: number[];
  moveLatency: PerfMoveLatency[];
  longtasks: PerfTimedEntry[];
  loafs: PerfTimedEntry[];
  events: PerfTimedEntry[];
  observerErrors: string[];
  audioContextStates: () => string[];
  rendererVersions: () => string[];
}

export interface PerfWindowSnapshot {
  commits: PerfCommitRecord[];
  starts: PerfStartRecord[];
  frames: number[];
  moves: number[];
  downs: number[];
  ups: number[];
  moveLatency: PerfMoveLatency[];
  longtasks: PerfTimedEntry[];
  loafs: PerfTimedEntry[];
  events: PerfTimedEntry[];
}

interface ReactDevtoolsHookStub {
  supportsFiber: boolean;
  isDisabled: boolean;
  renderers: Map<number, unknown>;
  inject: (renderer: unknown) => number;
  checkDCE: () => void;
  onScheduleFiberRoot: () => void;
  onCommitFiberRoot: (rendererId: number, root: PerfFiberRoot) => void;
  onCommitFiberUnmount: () => void;
  onPostCommitFiberRoot: () => void;
}

declare global {
  interface Window {
    __czabaPerf?: PerfState;
    __czabaPerfInjected?: () => void;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevtoolsHookStub;
  }
}

export function installPerfInstrumentation(): void {
  const contexts: AudioContext[] = [];
  const rendererVersions: string[] = [];
  const state: PerfState = {
    commits: [],
    starts: [],
    frames: [],
    moves: [],
    downs: [],
    ups: [],
    moveLatency: [],
    longtasks: [],
    loafs: [],
    events: [],
    observerErrors: [],
    audioContextStates: () => contexts.map((context) => context.state),
    rendererVersions: () => [...rendererVersions],
  };
  window.__czabaPerf = state;

  const componentTags = new Set([0, 1, 11, 14, 15]);
  const performedWork = 1;
  const countRenderedComponents = (root: PerfFiberRoot): number => {
    let rendered = 0;
    const visit = (fiber: PerfFiber): void => {
      let child = fiber.child;
      while (child) {
        const alternate = child.alternate;
        const didWork = (child.flags & performedWork) === performedWork;
        if (componentTags.has(child.tag) && (alternate === null || didWork)) {
          rendered += 1;
        }
        if (alternate === null || child.child !== alternate.child || didWork) {
          visit(child);
        }
        child = child.sibling;
      }
    };
    visit(root.current);
    return rendered;
  };

  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    isDisabled: false,
    renderers: new Map(),
    inject(renderer: unknown): number {
      const id = this.renderers.size + 1;
      this.renderers.set(id, renderer);
      if (
        typeof renderer === 'object' &&
        renderer !== null &&
        'version' in renderer &&
        typeof renderer.version === 'string'
      ) {
        rendererVersions.push(renderer.version);
      }
      return id;
    },
    checkDCE(): void {},
    onScheduleFiberRoot(): void {},
    onCommitFiberRoot(_rendererId: number, root: PerfFiberRoot): void {
      state.commits.push({ t: performance.now(), rendered: countRenderedComponents(root) });
    },
    onCommitFiberUnmount(): void {},
    onPostCommitFiberRoot(): void {},
  };

  const NativeAudioContext = window.AudioContext;
  class TrackedAudioContext extends NativeAudioContext {
    constructor(options?: AudioContextOptions) {
      super(options);
      contexts.push(this);
    }
  }
  window.AudioContext = TrackedAudioContext;

  let startTask = 0;
  let startTaskOpen = false;
  const taskBoundary = new MessageChannel();
  taskBoundary.port1.onmessage = () => {
    startTaskOpen = false;
  };
  const sourceClasses: { prototype: AudioScheduledSourceNode }[] = [
    AudioScheduledSourceNode,
    AudioBufferSourceNode,
    OscillatorNode,
    ConstantSourceNode,
  ];
  for (const sourceClass of sourceClasses) {
    const prototype = sourceClass.prototype;
    if (!Object.hasOwn(prototype, 'start')) continue;
    const nativeStart = prototype.start;
    prototype.start = function (this: AudioScheduledSourceNode, ...args: number[]): void {
      Reflect.apply(nativeStart, this, args);
      if (this.context instanceof OfflineAudioContext) return;
      if (!startTaskOpen) {
        startTask += 1;
        startTaskOpen = true;
        taskBoundary.port2.postMessage(null);
      }
      state.starts.push({ t: performance.now(), task: startTask });
    };
  }

  const observe = (
    options: PerformanceObserverInit & { durationThreshold?: number },
    target: PerfTimedEntry[],
  ): void => {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          target.push({ t: entry.startTime, duration: entry.duration, name: entry.name });
        }
      }).observe(options);
    } catch (error) {
      state.observerErrors.push(`${options.type}: ${String(error)}`);
    }
  };
  observe({ type: 'event', durationThreshold: 16, buffered: true }, state.events);
  observe({ type: 'long-animation-frame', buffered: true }, state.loafs);
  observe({ type: 'longtask', buffered: true }, state.longtasks);

  const tick = (timestamp: number): void => {
    state.frames.push(timestamp);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const pendingPaints: { move: number; t: number }[] = [];
  const paintChannel = new MessageChannel();
  paintChannel.port1.onmessage = () => {
    const pending = pendingPaints.shift();
    if (pending) state.moveLatency.push({ ...pending, latency: performance.now() - pending.t });
  };
  const captureOptions: AddEventListenerOptions = { capture: true, passive: true };
  window.addEventListener(
    'pointermove',
    () => {
      const t = performance.now();
      const move = state.moves.length;
      state.moves.push(t);
      requestAnimationFrame(() => {
        pendingPaints.push({ move, t });
        paintChannel.port2.postMessage(null);
      });
    },
    captureOptions,
  );
  window.addEventListener(
    'pointerdown',
    () => {
      state.downs.push(performance.now());
    },
    captureOptions,
  );
  window.addEventListener(
    'pointerup',
    () => {
      state.ups.push(performance.now());
    },
    captureOptions,
  );
}
