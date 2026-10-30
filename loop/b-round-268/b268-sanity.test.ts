import { it, expect } from 'vitest';
import { clipEnvelopeGainAtSource, clipEnvelopeRampSteps, clipEnvelopeDepthFromGain } from '~/lib/arrangement/envelope';
it('sanity', () => {
  const pts = [{ time: 0, gain: 1 }, { time: 4, gain: 0 }];
  const db = (g: number) => 20 * Math.log10(g);
  console.log([1,2,3].map((t) => db(clipEnvelopeGainAtSource(pts, t)).toFixed(3)));
  const steps = clipEnvelopeRampSteps(pts, 0, 4);
  console.log('steps', steps.length, steps.at(-1), steps.at(-2));
  let worst = 0;
  for (let i = 0; i < steps.length - 1; i++) { const a = i ? steps[i-1].gain : 1; worst = Math.max(worst, Math.abs(db(steps[i].gain) - db(a))); }
  console.log('worst step dB', worst);
  console.log('depth 0.5', clipEnvelopeDepthFromGain(0.5), 'depth 0.2512', clipEnvelopeDepthFromGain(0.2512));
  console.log('flat zero', clipEnvelopeRampSteps([{time:1,gain:0},{time:3,gain:0}],0,4));
  console.log('plateau', clipEnvelopeRampSteps([{time:1,gain:0.5},{time:3,gain:0.5}],0,4).length);
  expect(true).toBe(true);
});
