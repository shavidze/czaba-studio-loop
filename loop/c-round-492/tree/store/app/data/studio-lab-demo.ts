import {
  DEMO_STEM_BEAT_SECONDS,
  DEMO_SYNTH_SAMPLE_RATE,
  type DemoStemPart,
  generateSlowRiseSamples,
  generateSoftImpactSamples,
} from '~/lib/arrangement/demo-synth';
import { synthesizeDemoCompositionOffMainThread } from '~/lib/arrangement/demo-synth.client';
import { fetchAndDecodeSource } from '~/lib/arrangement/source-fetch';
import { publicPreviewSourceFetch } from '~/lib/arrangement/stem-cache.client';
import { studioSourceLoadStrings } from '~/lib/arrangement/strings';
import type { WorkspaceCollection, WorkspaceSource } from '~/types/arrangement';

const DEMO_COLLECTION_LABEL = 'Demo collection · CZABA public previews + synthetic sounds';
const PUBLIC_PREVIEW_COLLECTION_LABEL = 'CZABA public previews + synthetic SFX';
const SYNTHETIC_COMPOSITION_TITLE = 'Night Pulse';
const SYNTHETIC_COLLECTION_LABEL = `Synthetic demo · ${SYNTHETIC_COMPOSITION_TITLE}`;
const SYNTHETIC_COMPOSITION_BPM = 60 / DEMO_STEM_BEAT_SECONDS;

const demoUrls: Record<string, string> = {
  'demo-middle-east': '/middle-east.mp3',
  'demo-hero-music': '/videos/hero/hero-music.mp3',
};

const demoPeaksUrls: Record<string, string> = {
  'demo-middle-east': '/peaks/middle-east.peaks.json',
  'demo-hero-music': '/peaks/hero-music.peaks.json',
};

const demoSynths: Record<string, () => Float32Array<ArrayBuffer>> = {
  'demo-soft-impact': generateSoftImpactSamples,
  'demo-slow-rise': generateSlowRiseSamples,
};

const demoStemParts: Record<string, DemoStemPart> = {
  'demo-stem-pulse': 'pulse',
  'demo-stem-bass': 'bass',
  'demo-stem-pad': 'pad',
  'demo-stem-lead': 'lead',
};

const demoStemTitles: Record<DemoStemPart, string> = {
  pulse: 'Pulse',
  bass: 'Bass',
  pad: 'Pad',
  lead: 'Melody',
};

const studioLabDemoSources: WorkspaceSource[] = [
  {
    id: 'demo-middle-east',
    title: 'Middle East — public preview',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  {
    id: 'demo-hero-music',
    title: 'CZABA hero — public preview',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  {
    id: 'demo-soft-impact',
    title: 'Soft impact',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'sfx',
    origin: 'demo',
  },
  {
    id: 'demo-slow-rise',
    title: 'Slow rise',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'sfx',
    origin: 'demo',
  },
  {
    id: 'demo-synth-mix',
    title: `${SYNTHETIC_COMPOSITION_TITLE} · Full mix`,
    shortTitle: 'Full mix',
    collectionLabel: SYNTHETIC_COLLECTION_LABEL,
    kind: 'music',
    origin: 'demo',
    bpm: SYNTHETIC_COMPOSITION_BPM,
  },
  ...Object.entries(demoStemParts).map(
    ([id, part]): WorkspaceSource => ({
      id,
      title: `${SYNTHETIC_COMPOSITION_TITLE} · ${demoStemTitles[part]}`,
      shortTitle: demoStemTitles[part],
      collectionLabel: SYNTHETIC_COLLECTION_LABEL,
      kind: 'stem',
      origin: 'demo',
      bpm: SYNTHETIC_COMPOSITION_BPM,
    }),
  ),
];

function yieldToNextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function synthesizeDemoSamples(
  sourceId: string,
  signal: AbortSignal,
): Promise<Float32Array<ArrayBuffer> | null> {
  const part = demoStemParts[sourceId];
  if (part || sourceId === 'demo-synth-mix') {
    const composition = await synthesizeDemoCompositionOffMainThread();
    await yieldToNextTask();
    signal.throwIfAborted();
    return part ? composition.stems[part] : composition.mix;
  }
  const generate = demoSynths[sourceId];
  return generate ? generate() : null;
}

async function loadDemoSource(
  source: WorkspaceSource,
  ctx: BaseAudioContext,
  signal: AbortSignal,
): Promise<AudioBuffer> {
  const url = demoUrls[source.id];
  if (url) {
    return fetchAndDecodeSource(url, ctx, signal, publicPreviewSourceFetch());
  }
  const samples = await synthesizeDemoSamples(source.id, signal);
  if (!samples) {
    throw new Error(studioSourceLoadStrings.unknownDemoSource);
  }
  const buffer = new AudioBuffer({
    numberOfChannels: 2,
    length: samples.length,
    sampleRate: DEMO_SYNTH_SAMPLE_RATE,
  });
  buffer.copyToChannel(samples, 0);
  buffer.copyToChannel(samples, 1);
  return buffer;
}

export const studioLabDemoCollection: WorkspaceCollection = {
  id: 'studio-lab-demo',
  label: DEMO_COLLECTION_LABEL,
  origin: 'demo',
  notice: 'Synthetic demo stems — not CZABA catalogue audio.',
  sources: studioLabDemoSources,
  loadSource: loadDemoSource,
  canReloadSource: (source) => Object.hasOwn(demoUrls, source.id),
  previewUrl: (source) => (Object.hasOwn(demoUrls, source.id) ? demoUrls[source.id] : null),
  peaksUrl: (source) => (Object.hasOwn(demoPeaksUrls, source.id) ? demoPeaksUrls[source.id] : null),
};
