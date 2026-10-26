import { describe, expect, it } from 'vitest';
import {
  DEMO_STEM_DURATION,
  DEMO_STEM_PARTS,
  DEMO_SYNTH_SAMPLE_RATE,
  type DemoStemPart,
  getDemoStemComposition,
} from '../demo-synth';

const MINUS_SIX_DBFS = 10 ** (-6 / 20);

function peakOf(samples: Float32Array): number {
  let peak = 0;
  for (const value of samples) {
    peak = Math.max(peak, Math.abs(value));
  }
  return peak;
}

function rmsOf(samples: Float32Array): number {
  let sum = 0;
  for (const value of samples) {
    sum += value * value;
  }
  return Math.sqrt(sum / samples.length);
}

function correlation(a: Float32Array, b: Float32Array): number {
  let meanA = 0;
  let meanB = 0;
  for (let i = 0; i < a.length; i++) {
    meanA += a[i];
    meanB += b[i];
  }
  meanA /= a.length;
  meanB /= b.length;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < a.length; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  return cov / Math.sqrt(varA * varB);
}

describe('getDemoStemComposition (D-21 synthetic demo stems)', () => {
  const composition = getDemoStemComposition();

  it('generates four 16.000 s stems at 48 kHz, aligned at sample 0', () => {
    expect(DEMO_SYNTH_SAMPLE_RATE).toBe(48000);
    for (const part of DEMO_STEM_PARTS) {
      expect(composition.stems[part].length).toBe(DEMO_STEM_DURATION * DEMO_SYNTH_SAMPLE_RATE);
      expect(composition.stems[part].length / DEMO_SYNTH_SAMPLE_RATE).toBe(16);
    }
  });

  it('keeps every stem non-silent and at or below −6 dBFS', () => {
    for (const part of DEMO_STEM_PARTS) {
      expect(rmsOf(composition.stems[part])).toBeGreaterThan(0.005);
      expect(peakOf(composition.stems[part])).toBeLessThanOrEqual(MINUS_SIX_DBFS);
    }
  });

  it('keeps the four stems pairwise distinct (|ρ| < 0.5)', () => {
    const parts: DemoStemPart[] = [...DEMO_STEM_PARTS];
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const rho = correlation(composition.stems[parts[i]], composition.stems[parts[j]]);
        expect(Math.abs(rho)).toBeLessThan(0.5);
      }
    }
  });

  it('builds the full mix as the sample-wise sum of the four stems, without clipping', () => {
    const { stems, mix } = composition;
    let maxDiff = 0;
    for (let i = 0; i < mix.length; i++) {
      const sum = stems.pulse[i] + stems.bass[i] + stems.pad[i] + stems.lead[i];
      maxDiff = Math.max(maxDiff, Math.abs(mix[i] - sum));
    }
    expect(maxDiff).toBeLessThanOrEqual(1e-6);
    expect(peakOf(mix)).toBeLessThan(10 ** (-3 / 20));
  });

  it('is deterministic and places the pulse onsets on the 0.5 s beat grid', () => {
    expect(getDemoStemComposition()).toBe(composition);
    const pulse = composition.stems.pulse;
    const window = Math.round(0.01 * DEMO_SYNTH_SAMPLE_RATE);
    const beatEnergy = (start: number) => {
      let sum = 0;
      for (let i = start; i < start + window; i++) {
        sum += pulse[i] * pulse[i];
      }
      return sum;
    };
    const onBeat = beatEnergy(Math.round(2 * DEMO_SYNTH_SAMPLE_RATE));
    const beforeBeat = beatEnergy(Math.round(2.48 * DEMO_SYNTH_SAMPLE_RATE));
    expect(onBeat).toBeGreaterThan(beforeBeat * 10);
  });
});
