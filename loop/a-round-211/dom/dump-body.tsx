
import { writeFileSync } from 'node:fs';

const DUMP: Record<string, Record<string, string>> = {};

function snap(view: ReturnType<typeof render>, name: string) {
  const pick = (selector: string) => view.container.querySelector(selector)?.outerHTML ?? 'none';
  const detailContent = view.getByTestId('arrangement-detail-content');
  DUMP[name] = {
    clipGain: pick('[data-testid="arrangement-detail-clip-gain"]'),
    detailMiddle: detailContent.children[1]?.outerHTML ?? 'none',
    laneCm: pick('[data-clip-id="cm"]'),
    laneCx: pick('[data-clip-id="cx"]'),
    laneCv: pick('[data-clip-id="cv"]'),
  };
}

describe('dom dump', { timeout: 60_000 }, () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeWaveAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it('dumps', async () => {
    type Mounted = Awaited<ReturnType<typeof mountClipGainWorkspace>>;
    const cases: Array<[string, Record<string, number>, boolean, (m: Mounted) => void]> = [
      ['none', { cm: -6 }, false, () => undefined],
      ['single-6', { cm: -6 }, false, (m) => m.select(['cm'])],
      ['single-undefined', {}, false, (m) => m.select(['cm'])],
      ['single+24', { cm: 24 }, false, (m) => m.select(['cm'])],
      ['members-mixed', { cm: -6, cx: 1 }, false, (m) => m.select(MEMBERS)],
      ['members-equal', { cm: -3, cx: -3 }, false, (m) => m.select(MEMBERS)],
      ['members-zero', {}, false, (m) => m.select(MEMBERS)],
      ['members-video', { cm: -6 }, true, (m) => m.select(['cm', 'cv'])],
      ['single-video', {}, true, (m) => m.select(['cv'])],
      ['single-pending', { cm: -6 }, false, (m) => { m.select(['cm']); fireEvent.change(m.field(), { target: { value: '-3' } }); }],
      ['members-pending-mixed', { cm: -6, cx: 1 }, false, (m) => { m.select(MEMBERS); fireEvent.change(m.field(), { target: { value: '-3' } }); }],
      ['zoom2-single', { cm: -6 }, false, (m) => { fireEvent.change(m.view.getByTestId('arrangement-waveform-zoom'), { target: { value: '2' } }); m.select(['cm']); }],
      ['after-drag-commit', { cm: -6 }, false, (m) => { m.select(['cm']); pressFader(m.fader(), 50); windowPointer('pointermove', 50, 70); windowPointer('pointerup', 50, 70); }],
      ['after-members-commit', { cm: -6, cx: 1 }, false, (m) => { m.select(MEMBERS); pressFader(m.fader(), 51); windowPointer('pointermove', 51, 30); windowPointer('pointerup', 51, 30); }],
    ];
    for (const [name, gains, video, step] of cases) {
      const m = await mountClipGainWorkspace(gains, false, video);
      step(m);
      snap(m.view, name);
      m.view.unmount();
    }
    writeFileSync(process.env.DOM_DUMP_OUT ?? '/tmp/dom.json', JSON.stringify(DUMP, null, 1));
  });
});
