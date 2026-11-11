import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { APP_ROOT, appScriptSources, reachableScripts } from './helpers/style-scan';

const DEAD = ['glow-primary','video-sync','gradient-primary','gradient-hero','gradient-glow','hover-glow','interactive-card','audio-preview-inline-button','audioPlayingPulse','playButtonPulse','is-playing','product-detail-add-to-cart','newsletter-button-large','testimonial-card','waveform-bar','track-row-waveform','loading-brand','pack-card-3d','about-image-overlay','value-card','glass-card'];
const FOUR = ['components/product/TrackRow.tsx','components/audio/WaveForm.tsx','components/loading/TrackRowSkeleton.tsx','components/loading/PianoLoadingAnimation.tsx'];

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

it('flip probe', () => {
  const raw = appScriptSources();
  const stripped = new Map([...raw].map(([k, v]) => [k, stripComments(v)]));
  const a = reachableScripts(raw);
  const b = reachableScripts(stripped);
  const flipped = [...b].filter((f) => !a.has(f)).sort();
  const lost = [...a].filter((f) => !b.has(f)).sort();
  const out: string[] = [`raw=${a.size} stripped=${b.size}`, `flippedToReachable=${flipped.length}`];
  for (const f of flipped) {
    const src = readFileSync(resolve(APP_ROOT, f), 'utf8');
    const hits = DEAD.filter((t) => new RegExp(`(?<![\\w/.-])${t}(?![\\w-])`).test(src));
    out.push(`  ${f} deadTokens=[${hits.join(',')}] four=${FOUR.includes(f)}`);
  }
  out.push(`lostWhenStripped=${lost.join(',') || 'none'}`);
  out.push(`fourReachableStripped=${FOUR.map((f) => `${f}:${b.has(f)}`).join(' ')}`);
  console.log(`FLIPPROBE\n${out.join('\n')}`);
  expect(true).toBe(true);
});
