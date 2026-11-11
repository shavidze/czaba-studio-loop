// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { disconnectZoomProbe, installZoomProbe, readZoomProbe, resetZoomProbe } from './zoom-probe';

const svgNamespace = 'http://www.w3.org/2000/svg';

function buildZoomFixture() {
  const waveformSvg = document.createElementNS(svgNamespace, 'svg');
  waveformSvg.setAttribute('data-testid', 'arrangement-clip-waveform');
  const waveformPath = document.createElementNS(svgNamespace, 'path');
  waveformPath.setAttribute('d', 'M0 0');
  waveformSvg.append(waveformPath);

  const fadeSvg = document.createElementNS(svgNamespace, 'svg');
  fadeSvg.setAttribute('data-testid', 'arrangement-clip-fade-in');
  const fadePath = document.createElementNS(svgNamespace, 'path');
  fadePath.setAttribute('d', 'M0 0');
  fadeSvg.append(fadePath);

  const ruler = document.createElement('div');
  ruler.setAttribute('data-testid', 'arrangement-ruler');
  const tickRow = document.createElement('div');
  tickRow.append(document.createElement('span'));
  ruler.append(tickRow);

  const outside = document.createElement('div');
  document.body.append(waveformSvg, fadeSvg, ruler, outside);
  return { waveformPath, fadePath, ruler, tickRow, outside };
}

afterEach(() => {
  disconnectZoomProbe();
  document.body.replaceChildren();
});

describe('zoom probe (PERF-3c)', () => {
  it('ZP1: counts waveform d rewrites and ruler child mutations only', () => {
    const fixture = buildZoomFixture();
    installZoomProbe();

    fixture.waveformPath.setAttribute('d', 'M0 0 L1 1');
    fixture.fadePath.setAttribute('d', 'M0 0 L2 2');
    const tick = document.createElement('span');
    fixture.tickRow.append(tick);
    tick.remove();
    fixture.outside.append(document.createElement('span'));

    expect(readZoomProbe()).toEqual({ pathRewrites: 1, rulerMutations: 2, connected: true });
  });

  it('ZP2: a non-d attribute on the waveform path does not count', () => {
    const fixture = buildZoomFixture();
    installZoomProbe();

    fixture.waveformPath.setAttribute('fill', 'red');

    expect(readZoomProbe()).toEqual({ pathRewrites: 0, rulerMutations: 0, connected: true });
  });

  it('ZP3: reset zeroes the counts and keeps counting afterwards', () => {
    const fixture = buildZoomFixture();
    installZoomProbe();

    fixture.waveformPath.setAttribute('d', 'M0 0 L1 1');
    resetZoomProbe();
    expect(readZoomProbe()).toEqual({ pathRewrites: 0, rulerMutations: 0, connected: true });

    fixture.waveformPath.setAttribute('d', 'M0 0 L3 3');
    expect(readZoomProbe().pathRewrites).toBe(1);
  });

  it('ZP4: after disconnect nothing counts and the probe reports disconnected', async () => {
    const fixture = buildZoomFixture();
    installZoomProbe();
    fixture.waveformPath.setAttribute('d', 'M0 0 L1 1');
    disconnectZoomProbe();

    fixture.waveformPath.setAttribute('d', 'M0 0 L4 4');
    fixture.tickRow.append(document.createElement('span'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(readZoomProbe()).toEqual({ pathRewrites: 0, rulerMutations: 0, connected: false });
  });

  it('ZP6: a second install disconnects the first probe and counts once', async () => {
    const fixture = buildZoomFixture();
    installZoomProbe();
    const firstProbe = window.__czabaZoomProbe;
    installZoomProbe();

    fixture.waveformPath.setAttribute('d', 'M0 0 L5 5');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(firstProbe?.connected).toBe(false);
    expect(firstProbe?.counts).toEqual({ pathRewrites: 0, rulerMutations: 0 });
    expect(readZoomProbe()).toEqual({ pathRewrites: 1, rulerMutations: 0, connected: true });
  });

  it('ZP5: read without install reports disconnected zeros', () => {
    expect(readZoomProbe()).toEqual({ pathRewrites: 0, rulerMutations: 0, connected: false });
  });
});
