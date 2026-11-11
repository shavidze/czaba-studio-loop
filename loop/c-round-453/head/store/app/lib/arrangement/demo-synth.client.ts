import { DEMO_STEM_PARTS, type DemoStemComposition, getDemoStemComposition } from './demo-synth';

export const DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS = 10_000;

export interface DemoSynthWorkerResponse {
  type: 'complete';
  composition: DemoStemComposition;
}

function isDemoSamples(value: unknown): value is Float32Array<ArrayBuffer> {
  return value instanceof Float32Array && value.buffer instanceof ArrayBuffer;
}

function readDemoComposition(value: unknown): DemoStemComposition | null {
  if (typeof value !== 'object' || value === null || !('mix' in value) || !('stems' in value)) {
    return null;
  }
  const { mix, stems } = value;
  if (!isDemoSamples(mix) || typeof stems !== 'object' || stems === null) {
    return null;
  }
  const parts = new Map(Object.entries(stems));
  const pulse = parts.get('pulse');
  const bass = parts.get('bass');
  const pad = parts.get('pad');
  const lead = parts.get('lead');
  if (
    !isDemoSamples(pulse) ||
    !isDemoSamples(bass) ||
    !isDemoSamples(pad) ||
    !isDemoSamples(lead)
  ) {
    return null;
  }
  return { mix, stems: { pulse, bass, pad, lead } };
}

export function readDemoSynthWorkerComposition(data: unknown): DemoStemComposition | null {
  if (typeof data !== 'object' || data === null || !('type' in data) || data.type !== 'complete') {
    return null;
  }
  return 'composition' in data ? readDemoComposition(data.composition) : null;
}

export function demoCompositionTransfer(composition: DemoStemComposition): ArrayBuffer[] {
  return [composition.mix.buffer, ...DEMO_STEM_PARTS.map((part) => composition.stems[part].buffer)];
}

function synthesizeDemoCompositionInWorker(): Promise<DemoStemComposition> {
  return new Promise<DemoStemComposition>((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./demo-synth.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      resolve(getDemoStemComposition());
      return;
    }
    let stallTimer = 0;
    const finish = (composition: DemoStemComposition | null) => {
      window.clearTimeout(stallTimer);
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      resolve(composition ?? getDemoStemComposition());
    };
    worker.onmessage = (event: MessageEvent<unknown>) =>
      finish(readDemoSynthWorkerComposition(event.data));
    worker.onerror = () => finish(null);
    worker.onmessageerror = () => finish(null);
    stallTimer = window.setTimeout(() => finish(null), DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS);
    try {
      worker.postMessage({ type: 'synthesize' });
    } catch {
      finish(null);
    }
  });
}

let demoCompositionJob: Promise<DemoStemComposition> | null = null;

export function synthesizeDemoCompositionOffMainThread(): Promise<DemoStemComposition> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(getDemoStemComposition());
  }
  demoCompositionJob ??= synthesizeDemoCompositionInWorker();
  return demoCompositionJob;
}
