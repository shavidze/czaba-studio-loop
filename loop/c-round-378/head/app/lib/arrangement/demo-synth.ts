export const DEMO_SYNTH_SAMPLE_RATE = 48000;
export const SOFT_IMPACT_DURATION = 2;
export const SLOW_RISE_DURATION = 5;

export function generateSoftImpactSamples(): Float32Array<ArrayBuffer> {
  const length = SOFT_IMPACT_DURATION * DEMO_SYNTH_SAMPLE_RATE;
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / DEMO_SYNTH_SAMPLE_RATE;
    const body = 0.7 * Math.cos(2 * Math.PI * 62 * t) + 0.3 * Math.cos(2 * Math.PI * 187 * t);
    samples[i] = body * Math.exp(-3.2 * t);
  }
  return samples;
}

export function generateSlowRiseSamples(): Float32Array<ArrayBuffer> {
  const length = SLOW_RISE_DURATION * DEMO_SYNTH_SAMPLE_RATE;
  const samples = new Float32Array(length);
  const startHz = 180;
  const endHz = 1800;
  for (let i = 0; i < length; i++) {
    const t = i / DEMO_SYNTH_SAMPLE_RATE;
    const phase =
      2 * Math.PI * (startHz * t + ((endHz - startHz) * t * t) / (2 * SLOW_RISE_DURATION));
    const envelope = 0.6 * (t / SLOW_RISE_DURATION) ** 1.5;
    samples[i] = envelope * Math.sin(phase);
  }
  return samples;
}

export const DEMO_STEM_DURATION = 16;
export const DEMO_STEM_BEAT_SECONDS = 0.5;

export type DemoStemPart = 'pulse' | 'bass' | 'pad' | 'lead';

export const DEMO_STEM_PARTS: readonly DemoStemPart[] = ['pulse', 'bass', 'pad', 'lead'];

export interface DemoStemComposition {
  stems: Record<DemoStemPart, Float32Array<ArrayBuffer>>;
  mix: Float32Array<ArrayBuffer>;
}

const DEMO_CHORD_ROOTS_HZ = [110, 87.307, 130.813, 97.999];
const DEMO_CHORD_INTERVALS = [
  [1, 1.189, 1.498],
  [1, 1.26, 1.498],
  [1, 1.26, 1.498],
  [1, 1.26, 1.498],
];
const DEMO_LEAD_STEPS = [0, 3, 5, 7, 10, 7, 5, 3, 0, 5, 7, 12, 10, 7, 5, 3];
const DEMO_BAR_SECONDS = 4 * DEMO_STEM_BEAT_SECONDS;

function demoStemLength(): number {
  return DEMO_STEM_DURATION * DEMO_SYNTH_SAMPLE_RATE;
}

function demoChordIndex(t: number): number {
  return Math.floor(t / DEMO_BAR_SECONDS) % DEMO_CHORD_ROOTS_HZ.length;
}

function createDemoNoise(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2147483648 - 1;
  };
}

function generateDemoPulse(): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(demoStemLength());
  const noise = createDemoNoise(20261007);
  for (let i = 0; i < samples.length; i++) {
    const t = i / DEMO_SYNTH_SAMPLE_RATE;
    const beatTime = t % DEMO_STEM_BEAT_SECONDS;
    const kickPhase = 2 * Math.PI * (48 * beatTime + 9 * (1 - Math.exp(-beatTime * 30)));
    const kick = Math.sin(kickPhase) * Math.exp(-beatTime * 14);
    const offBeat = (t + DEMO_STEM_BEAT_SECONDS / 2) % DEMO_STEM_BEAT_SECONDS;
    const hat = noise() * Math.exp(-offBeat * 90);
    samples[i] = 0.3 * kick + 0.06 * hat;
  }
  return samples;
}

function generateDemoBass(): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(demoStemLength());
  const eighth = DEMO_STEM_BEAT_SECONDS / 2;
  let phase = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / DEMO_SYNTH_SAMPLE_RATE;
    const root = DEMO_CHORD_ROOTS_HZ[demoChordIndex(t)] / 2;
    const step = Math.floor(t / eighth) % 8;
    const frequency = step === 3 || step === 7 ? root * 1.498 : root;
    phase += (2 * Math.PI * frequency) / DEMO_SYNTH_SAMPLE_RATE;
    const noteTime = t % eighth;
    const envelope = Math.min(1, noteTime * 200) * Math.exp(-noteTime * 5);
    const tone = Math.sin(phase) + 0.45 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase);
    samples[i] = 0.17 * envelope * tone;
  }
  return samples;
}

function generateDemoPad(): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(demoStemLength());
  const phases = [0, 0, 0];
  for (let i = 0; i < samples.length; i++) {
    const t = i / DEMO_SYNTH_SAMPLE_RATE;
    const chord = demoChordIndex(t);
    const barTime = t % DEMO_BAR_SECONDS;
    const swell = Math.min(1, barTime / 0.6) * Math.min(1, (DEMO_BAR_SECONDS - barTime) / 0.3);
    let value = 0;
    for (let voice = 0; voice < 3; voice++) {
      const frequency = DEMO_CHORD_ROOTS_HZ[chord] * 2 * DEMO_CHORD_INTERVALS[chord][voice];
      phases[voice] += (2 * Math.PI * frequency) / DEMO_SYNTH_SAMPLE_RATE;
      value += Math.sin(phases[voice]) + 0.25 * Math.sin(2 * phases[voice] + 0.7);
    }
    const shimmer = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
    samples[i] = 0.045 * swell * shimmer * value;
  }
  return samples;
}

function generateDemoLead(): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(demoStemLength());
  let phase = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / DEMO_SYNTH_SAMPLE_RATE;
    const noteIndex = Math.floor(t / DEMO_STEM_BEAT_SECONDS) % DEMO_LEAD_STEPS.length;
    const noteTime = t % DEMO_STEM_BEAT_SECONDS;
    const frequency = 440 * 2 ** (DEMO_LEAD_STEPS[noteIndex] / 12);
    const vibrato = 1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * t);
    phase += (2 * Math.PI * frequency * vibrato) / DEMO_SYNTH_SAMPLE_RATE;
    const envelope =
      Math.min(1, noteTime * 60) * Math.max(0, 1 - noteTime / DEMO_STEM_BEAT_SECONDS) ** 0.6;
    const active = Math.floor(t / DEMO_BAR_SECONDS) % 2 === 1 || t >= DEMO_STEM_DURATION / 2;
    samples[i] = active ? 0.16 * envelope * (Math.sin(phase) + 0.3 * Math.sin(3 * phase)) : 0;
  }
  return samples;
}

let cachedDemoComposition: DemoStemComposition | null = null;

export function getDemoStemComposition(): DemoStemComposition {
  if (cachedDemoComposition) {
    return cachedDemoComposition;
  }
  const stems: Record<DemoStemPart, Float32Array<ArrayBuffer>> = {
    pulse: generateDemoPulse(),
    bass: generateDemoBass(),
    pad: generateDemoPad(),
    lead: generateDemoLead(),
  };
  const mix = new Float32Array(demoStemLength());
  for (let i = 0; i < mix.length; i++) {
    mix[i] = stems.pulse[i] + stems.bass[i] + stems.pad[i] + stems.lead[i];
  }
  cachedDemoComposition = { stems, mix };
  return cachedDemoComposition;
}

export function generateDemoStereoChannels(
  generate: () => Float32Array<ArrayBuffer>,
): Float32Array<ArrayBuffer>[] {
  const left = generate();
  return [left, new Float32Array(left)];
}
