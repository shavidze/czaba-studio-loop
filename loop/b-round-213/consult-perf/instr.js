"use strict";
var czabaPerfLib = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../../../../../../czaba-project/store/perf/lib/instrumentation.ts
  var instrumentation_exports = {};
  __export(instrumentation_exports, {
    installPerfInstrumentation: () => installPerfInstrumentation
  });
  function installPerfInstrumentation() {
    const contexts = [];
    const state = {
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
      audioContextStates: () => contexts.map((context) => context.state)
    };
    window.__czabaPerf = state;
    const componentTags = /* @__PURE__ */ new Set([0, 1, 11, 14, 15]);
    const performedWork = 1;
    const countRenderedComponents = (root) => {
      let rendered = 0;
      const visit = (fiber) => {
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
      renderers: /* @__PURE__ */ new Map(),
      inject(renderer) {
        const id = this.renderers.size + 1;
        this.renderers.set(id, renderer);
        return id;
      },
      checkDCE() {
      },
      onScheduleFiberRoot() {
      },
      onCommitFiberRoot(_rendererId, root) {
        state.commits.push({ t: performance.now(), rendered: countRenderedComponents(root) });
      },
      onCommitFiberUnmount() {
      },
      onPostCommitFiberRoot() {
      }
    };
    const NativeAudioContext = window.AudioContext;
    class TrackedAudioContext extends NativeAudioContext {
      constructor(options) {
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
    const sourceClasses = [
      AudioScheduledSourceNode,
      AudioBufferSourceNode,
      OscillatorNode,
      ConstantSourceNode
    ];
    for (const sourceClass of sourceClasses) {
      const prototype = sourceClass.prototype;
      if (!Object.hasOwn(prototype, "start"))
        continue;
      const nativeStart = prototype.start;
      prototype.start = function(...args) {
        Reflect.apply(nativeStart, this, args);
        if (this.context instanceof OfflineAudioContext)
          return;
        if (!startTaskOpen) {
          startTask += 1;
          startTaskOpen = true;
          taskBoundary.port2.postMessage(null);
        }
        state.starts.push({ t: performance.now(), task: startTask });
      };
    }
    const observe = (options, target) => {
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
    observe({ type: "event", durationThreshold: 16, buffered: true }, state.events);
    observe({ type: "long-animation-frame", buffered: true }, state.loafs);
    observe({ type: "longtask", buffered: true }, state.longtasks);
    const tick = (timestamp) => {
      state.frames.push(timestamp);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const pendingPaints = [];
    const paintChannel = new MessageChannel();
    paintChannel.port1.onmessage = () => {
      const pending = pendingPaints.shift();
      if (pending)
        state.moveLatency.push({ ...pending, latency: performance.now() - pending.t });
    };
    const captureOptions = { capture: true, passive: true };
    window.addEventListener(
      "pointermove",
      () => {
        const t = performance.now();
        const move = state.moves.length;
        state.moves.push(t);
        requestAnimationFrame(() => {
          pendingPaints.push({ move, t });
          paintChannel.port2.postMessage(null);
        });
      },
      captureOptions
    );
    window.addEventListener(
      "pointerdown",
      () => {
        state.downs.push(performance.now());
      },
      captureOptions
    );
    window.addEventListener(
      "pointerup",
      () => {
        state.ups.push(performance.now());
      },
      captureOptions
    );
  }
  return __toCommonJS(instrumentation_exports);
})();
