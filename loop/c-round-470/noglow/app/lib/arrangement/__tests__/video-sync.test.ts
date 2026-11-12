import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip, ArrangementLoop } from '~/types/arrangement';
import { createArrangement } from '../model';
import {
  canEscalateAfterSeeked,
  createVideoSettleState,
  createVideoStallWindow,
  holdRelease,
  isContinuousVideoBoundary,
  isVideoRateAtStallEdge,
  nextPredictableDiscontinuity,
  shouldEscalateVideoStall,
  shouldHardSeek,
  VIDEO_RATE_GAIN,
  VIDEO_RATE_MAX,
  VIDEO_RATE_MIN,
  VIDEO_RATE_STEP,
  VIDEO_SEEK_PENDING_TIMEOUT_MS,
  VIDEO_SETTLE_BAND_SECONDS,
  VIDEO_SETTLE_GAIN,
  VIDEO_SETTLE_MAX_SECONDS,
  VIDEO_SETTLE_RATE_MAX,
  VIDEO_SETTLE_RATE_MIN,
  VIDEO_STALL_DRIFT_SECONDS,
  VIDEO_STALL_ESCALATION_INTERVAL_MS,
  VIDEO_STALL_LAG_RATE,
  VIDEO_STALL_LEAD_RATE,
  VIDEO_STALL_WINDOW_SECONDS,
  VIDEO_STANDBY_HORIZON_SECONDS,
  type VideoSettleState,
  type VideoStallSample,
  videoRateCorrection,
  videoSettleRateCorrection,
} from '../video-sync';

function arrangementWith(clips: ArrangementClip[]): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips,
  };
}

function videoClip(
  id: string,
  start: number,
  duration: number,
  sourceOffset = 0,
  sourceId = `src-${id}`,
): ArrangementClip {
  return { id, trackId: 'video', sourceId, start, sourceOffset, duration };
}

const loop = (start: number, end: number): ArrangementLoop => ({ start, end, enabled: true });

describe('videoRateCorrection (D-19 rule 4)', () => {
  it('uses a gain K inside [2, 5]', () => {
    expect(VIDEO_RATE_GAIN).toBeGreaterThanOrEqual(2);
    expect(VIDEO_RATE_GAIN).toBeLessThanOrEqual(5);
  });

  it('returns exactly 1 in the 20 ms dead band', () => {
    for (const drift of [0, 0.01, -0.01, 0.02, -0.02]) {
      expect(videoRateCorrection(drift)).toBe(1);
    }
  });

  it('stays inside [0.5, 2.0] for any drift', () => {
    for (let drift = -3; drift <= 3; drift += 0.0137) {
      const rate = videoRateCorrection(drift);
      expect(rate).toBeGreaterThanOrEqual(VIDEO_RATE_MIN);
      expect(rate).toBeLessThanOrEqual(VIDEO_RATE_MAX);
    }
    expect(videoRateCorrection(-1)).toBe(2);
    expect(videoRateCorrection(1)).toBe(0.5);
  });

  it('is monotone non-increasing in the drift', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let drift = -1.2; drift <= 1.2; drift += 0.0011) {
      const rate = videoRateCorrection(drift);
      expect(rate).toBeLessThanOrEqual(previous + 1e-12);
      previous = rate;
    }
  });

  it('is symmetric in sign around 1 wherever the clamp is not reached', () => {
    for (const drift of [0.021, 0.05, 0.08, 0.11, 0.125]) {
      expect(1 - videoRateCorrection(drift)).toBeCloseTo(videoRateCorrection(-drift) - 1, 12);
    }
  });
});

describe('isContinuousVideoBoundary', () => {
  it('treats a same-source, media-continuous adjacent clip as continuous', () => {
    const left = videoClip('l', 0, 3, 0, 'film');
    const right = videoClip('r', 3, 3, 3, 'film');
    expect(isContinuousVideoBoundary(left, right)).toBe(true);
  });

  it('rejects a media jump, a source change and a timeline gap', () => {
    const left = videoClip('l', 1, 1, 2, 'film');
    expect(isContinuousVideoBoundary(left, videoClip('r', 2, 3, 3.5, 'film'))).toBe(false);
    expect(isContinuousVideoBoundary(left, videoClip('r', 2, 3, 3, 'other'))).toBe(false);
    expect(isContinuousVideoBoundary(left, videoClip('r', 2.5, 3, 3.5, 'film'))).toBe(false);
    expect(isContinuousVideoBoundary(null, videoClip('r', 2, 3, 3, 'film'))).toBe(false);
  });
});

describe('nextPredictableDiscontinuity', () => {
  const r3v1 = arrangementWith([videoClip('a', 0, 6.008), videoClip('b', 8, 4.008)]);
  const r2v3 = arrangementWith([
    videoClip('p1', 0.5, 0.5, 0.5, 'film'),
    videoClip('p2', 1, 1, 2, 'film'),
    videoClip('p3', 2, 3.008, 3, 'film'),
  ]);

  it('finds a gap entry inside the horizon', () => {
    const next = nextPredictableDiscontinuity(r3v1, null, 7.2, VIDEO_STANDBY_HORIZON_SECONDS);
    expect(next).toMatchObject({ kind: 'gap-entry', clipId: 'b', atPosition: 8, mediaTime: 0 });
    expect(next?.delay).toBeCloseTo(0.8, 9);
  });

  it('returns nothing beyond the horizon', () => {
    expect(nextPredictableDiscontinuity(r3v1, null, 6.9, VIDEO_STANDBY_HORIZON_SECONDS)).toBeNull();
    expect(nextPredictableDiscontinuity(r3v1, null, 2, VIDEO_STANDBY_HORIZON_SECONDS)).toBeNull();
    expect(
      nextPredictableDiscontinuity(r3v1, null, 12.5, VIDEO_STANDBY_HORIZON_SECONDS),
    ).toBeNull();
  });

  it('finds a non-continuous same-source boundary and skips a continuous one', () => {
    const atOne = nextPredictableDiscontinuity(r2v3, null, 0.7, VIDEO_STANDBY_HORIZON_SECONDS);
    expect(atOne).toMatchObject({ kind: 'boundary', clipId: 'p2', mediaTime: 2, atPosition: 1 });
    expect(atOne?.delay).toBeCloseTo(0.3, 9);
    expect(nextPredictableDiscontinuity(r2v3, null, 1.5, VIDEO_STANDBY_HORIZON_SECONDS)).toBeNull();
  });

  it('finds the entry from the leading gap', () => {
    expect(
      nextPredictableDiscontinuity(r2v3, null, 0, VIDEO_STANDBY_HORIZON_SECONDS),
    ).toMatchObject({ kind: 'gap-entry', clipId: 'p1', mediaTime: 0.5 });
  });

  it('finds a loop wrap and maps it to the media time at loop.start', () => {
    const single = arrangementWith([videoClip('v', 0, 6.008, 0, 'film')]);
    const wrap = nextPredictableDiscontinuity(
      single,
      loop(2, 4),
      3.4,
      VIDEO_STANDBY_HORIZON_SECONDS,
    );
    expect(wrap).toMatchObject({ kind: 'wrap', clipId: 'v', atPosition: 2, mediaTime: 2 });
    expect(wrap?.delay).toBeCloseTo(0.6, 9);
    expect(
      nextPredictableDiscontinuity(single, loop(2, 4), 2.5, VIDEO_STANDBY_HORIZON_SECONDS),
    ).toBeNull();
  });

  it('ignores boundaries past loop.end and reports the wrap instead', () => {
    const wrap = nextPredictableDiscontinuity(r3v1, loop(5, 7.5), 7.2, 1);
    expect(wrap).toMatchObject({ kind: 'wrap', clipId: 'a', mediaTime: 5 });
    expect(wrap?.delay).toBeCloseTo(0.3, 9);
  });

  it('continues scanning after a wrap that lands in a gap', () => {
    expect(nextPredictableDiscontinuity(r3v1, loop(7, 9), 8.8, 1)).toBeNull();
    const next = nextPredictableDiscontinuity(r3v1, loop(7, 9), 8.8, 1.5);
    expect(next).toMatchObject({ kind: 'gap-entry', clipId: 'b', atPosition: 8 });
    expect(next?.delay).toBeCloseTo(1.2, 9);
  });

  it('does not treat a loop that starts after the position as active', () => {
    const single = arrangementWith([videoClip('v', 0, 6.008, 0, 'film')]);
    expect(nextPredictableDiscontinuity(single, loop(1, 2), 4, 1)).toBeNull();
  });
});

describe('shouldHardSeek (D-19 rules 3–5)', () => {
  it('does not seek on a continuous clip change', () => {
    expect(
      shouldHardSeek({ clipChanged: true, continuous: true, mappingJump: 0.001, drift: 0.05 }),
    ).toBe(false);
  });

  it('seeks on a non-continuous change, a mapping jump over 80 ms and a drift over 1 s', () => {
    expect(shouldHardSeek({ clipChanged: true, continuous: false, mappingJump: 0, drift: 0 })).toBe(
      true,
    );
    expect(
      shouldHardSeek({ clipChanged: false, continuous: false, mappingJump: 0.09, drift: 0 }),
    ).toBe(true);
    expect(
      shouldHardSeek({ clipChanged: false, continuous: false, mappingJump: 0, drift: -1.01 }),
    ).toBe(true);
  });

  it('leaves drift up to 1 s to soft sync', () => {
    expect(
      shouldHardSeek({ clipChanged: false, continuous: false, mappingJump: 0.05, drift: 0.9 }),
    ).toBe(false);
  });
});

describe('holdRelease', () => {
  it('holds while the frame is ahead of the live target by more than one frame', () => {
    expect(holdRelease(2.3, 2.0, 1 / 60)).toBe('hold');
    expect(holdRelease(2.05, 2.0, 1 / 60)).toBe('hold');
  });

  it('plays once the live target is within one frame, or when the frame is behind', () => {
    expect(holdRelease(2.01, 2.0, 1 / 60)).toBe('play');
    expect(holdRelease(1.8, 2.0, 1 / 60)).toBe('play');
  });

  it('caps the early side at 20 ms even for slow frames (rule 7)', () => {
    expect(holdRelease(2.025, 2.0, 0.05)).toBe('hold');
    expect(holdRelease(2.019, 2.0, 0.05)).toBe('play');
  });

  it('implements the start hold: play only when ctx ≥ startAt − min(frame, 20 ms)', () => {
    const startMedia = 1;
    const frameInterval = 1 / 60;
    const decide = (ctx: number, startAt: number) =>
      holdRelease(startMedia, startMedia - Math.max(0, startAt - ctx), frameInterval);
    expect(decide(10, 10.05)).toBe('hold');
    expect(decide(10.03, 10.05)).toBe('hold');
    expect(decide(10.034, 10.05)).toBe('play');
    expect(decide(10.05, 10.05)).toBe('play');
  });

  it('falls back to a 60 Hz frame for an unknown frame interval', () => {
    expect(holdRelease(2.01, 2, Number.NaN)).toBe('play');
    expect(holdRelease(2.03, 2, 0)).toBe('hold');
  });
});

function stallSeries(
  drifts: readonly number[],
  stepSeconds = 0.05,
  rateFor: (drift: number) => number = videoRateCorrection,
): VideoStallSample[] {
  return drifts.map((drift, index) => ({
    ctxTime: 10 + index * stepSeconds,
    drift,
    rate: rateFor(drift),
  }));
}

describe('D-24 stall escalation (RF5-U)', () => {
  it('uses constants inside the B ranges and an edge rate that coincides with D', () => {
    expect(VIDEO_STALL_WINDOW_SECONDS).toBeGreaterThanOrEqual(0.2);
    expect(VIDEO_STALL_WINDOW_SECONDS).toBeLessThanOrEqual(0.4);
    expect(VIDEO_STALL_DRIFT_SECONDS).toBeGreaterThanOrEqual(0.08);
    expect(VIDEO_STALL_DRIFT_SECONDS).toBeLessThanOrEqual(0.15);
    expect(videoRateCorrection(-VIDEO_STALL_DRIFT_SECONDS)).toBeGreaterThanOrEqual(1.5);
    expect(videoRateCorrection(VIDEO_STALL_DRIFT_SECONDS)).toBeLessThanOrEqual(0.5);
  });

  it('escalates a lagging window at the maximum rate whose drift grows', () => {
    const samples = stallSeries([-0.25, -0.27, -0.29, -0.31, -0.33, -0.35, -0.37, -0.39]);
    expect(samples.every((sample) => sample.rate === VIDEO_RATE_MAX)).toBe(true);
    expect(shouldEscalateVideoStall(samples)).toBe(true);
  });

  it('escalates a lagging window whose drift stays flat at the edge', () => {
    expect(shouldEscalateVideoStall(stallSeries([-0.2, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2]))).toBe(
      true,
    );
  });

  it('escalates the symmetric leading case at the minimum rate', () => {
    const samples = stallSeries([0.13, 0.15, 0.17, 0.19, 0.21, 0.23, 0.25]);
    expect(samples.every((sample) => sample.rate === VIDEO_RATE_MIN)).toBe(true);
    expect(shouldEscalateVideoStall(samples)).toBe(true);
  });

  it('does not escalate while the drift is shrinking', () => {
    expect(
      shouldEscalateVideoStall(stallSeries([-0.3, -0.29, -0.28, -0.27, -0.26, -0.25, -0.24])),
    ).toBe(false);
    expect(shouldEscalateVideoStall(stallSeries([0.3, 0.29, 0.28, 0.27, 0.26, 0.25, 0.24]))).toBe(
      false,
    );
  });

  it('does not escalate at or below D', () => {
    expect(
      shouldEscalateVideoStall(
        stallSeries([-0.12, -0.12, -0.12, -0.12, -0.12, -0.12, -0.12, -0.12], 0.05, () => 2),
      ),
    ).toBe(false);
  });

  it('does not escalate at a non-edge rate', () => {
    expect(
      shouldEscalateVideoStall(
        stallSeries([-0.2, -0.21, -0.22, -0.23, -0.24, -0.25, -0.26, -0.27], 0.05, () => 1.45),
      ),
    ).toBe(false);
    expect(
      shouldEscalateVideoStall(
        stallSeries([0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27], 0.05, () => 0.55),
      ),
    ).toBe(false);
  });

  it('does not escalate with fewer than T of edge samples', () => {
    expect(shouldEscalateVideoStall(stallSeries([-0.2, -0.22, -0.24, -0.26, -0.28]))).toBe(false);
    expect(shouldEscalateVideoStall([])).toBe(false);
  });

  it('does not count edge samples of the opposite direction toward T', () => {
    const samples = [
      ...stallSeries([0.2, 0.2, 0.2, 0.2]),
      ...stallSeries([-0.2, -0.22, -0.24], 0.05).map((sample, index) => ({
        ...sample,
        ctxTime: 10.2 + index * 0.05,
      })),
    ];
    expect(shouldEscalateVideoStall(samples)).toBe(false);
  });

  it('resets on seek: the stateful window forgets samples before the reset', () => {
    const window = createVideoStallWindow();
    for (const sample of stallSeries([-0.2, -0.22, -0.24, -0.26, -0.28, -0.3, -0.32])) {
      window.pushStallSample(sample);
    }
    expect(window.shouldEscalateStall()).toBe(true);
    window.resetStallWindow();
    expect(window.shouldEscalateStall()).toBe(false);
    const after = stallSeries([-0.2, -0.22, -0.24, -0.26]).map((sample) => ({
      ...sample,
      ctxTime: sample.ctxTime + 5,
    }));
    for (const sample of after) {
      window.pushStallSample(sample);
    }
    expect(window.shouldEscalateStall()).toBe(false);
  });

  it('drops samples older than the history horizon and restarts on a clock jump back', () => {
    const window = createVideoStallWindow();
    for (const sample of stallSeries([-0.2, -0.22, -0.24, -0.26, -0.28, -0.3, -0.32])) {
      window.pushStallSample(sample);
    }
    window.pushStallSample({ ctxTime: 1, drift: -0.34, rate: 2 });
    expect(window.shouldEscalateStall()).toBe(false);
  });
});

describe('D-24a escalation interval (B-R5-01, RF6-U)', () => {
  it('uses a 600 ms interval measured from the previous escalation seeked', () => {
    expect(VIDEO_STALL_ESCALATION_INTERVAL_MS).toBe(600);
    expect(canEscalateAfterSeeked({ escalatedAt: null, seekedAt: 0, now: 0 })).toBe(true);
    expect(canEscalateAfterSeeked({ escalatedAt: 1000, seekedAt: 1100, now: 1699 })).toBe(false);
    expect(canEscalateAfterSeeked({ escalatedAt: 1000, seekedAt: 1100, now: 1700 })).toBe(true);
  });

  it('waits for the seek to settle; a missing seeked falls back to the pending timeout', () => {
    expect(canEscalateAfterSeeked({ escalatedAt: 1000, seekedAt: 900, now: 2400 })).toBe(false);
    const fallback = 1000 + VIDEO_SEEK_PENDING_TIMEOUT_MS + VIDEO_STALL_ESCALATION_INTERVAL_MS;
    expect(canEscalateAfterSeeked({ escalatedAt: 1000, seekedAt: 900, now: fallback - 1 })).toBe(
      false,
    );
    expect(canEscalateAfterSeeked({ escalatedAt: 1000, seekedAt: 900, now: fallback })).toBe(true);
  });

  it('spaces escalations under persistent lag at seeked + 600 ms with counted time within T + 150 ms', () => {
    const frameMs = 16;
    const seekLatencyMs = 120;
    const holdMs = 300;
    const persistentDrift = -0.2;
    const window = createVideoStallWindow();
    let escalatedAt: number | null = null;
    let seekedAt = Number.NEGATIVE_INFINITY;
    let resumeAt = 0;
    const escalations: { at: number; previousSeeked: number }[] = [];
    for (let now = 0; now <= 6000; now += frameMs) {
      if (escalatedAt !== null && seekedAt < escalatedAt && now >= escalatedAt + seekLatencyMs) {
        seekedAt = escalatedAt + seekLatencyMs;
        resumeAt = seekedAt + holdMs;
      }
      const seeking = escalatedAt !== null && seekedAt < escalatedAt;
      if (seeking || now < resumeAt) {
        window.resetStallWindow();
        continue;
      }
      window.pushStallSample({
        ctxTime: now / 1000,
        drift: persistentDrift,
        rate: videoRateCorrection(persistentDrift),
      });
      if (canEscalateAfterSeeked({ escalatedAt, seekedAt, now }) && window.shouldEscalateStall()) {
        escalations.push({ at: now, previousSeeked: seekedAt });
        escalatedAt = now;
        window.resetStallWindow();
      }
    }
    expect(escalations.length).toBeGreaterThanOrEqual(3);
    for (const entry of escalations.slice(1)) {
      const sinceSeeked = entry.at - entry.previousSeeked;
      expect(sinceSeeked).toBeGreaterThanOrEqual(VIDEO_STALL_ESCALATION_INTERVAL_MS);
      expect(sinceSeeked).toBeLessThanOrEqual(VIDEO_STALL_ESCALATION_INTERVAL_MS + frameMs);
      const counted = entry.at - (entry.previousSeeked + holdMs);
      expect(counted).toBeLessThanOrEqual(VIDEO_STALL_WINDOW_SECONDS * 1000 + 150);
    }
  });
});

const SETTLE_FRAME_SECONDS = 1 / 60;
const SETTLE_DRIFT_GRID = Array.from({ length: 2401 }, (_, index) => -1.2 + index * 0.001);

function expectSteadyRule(settle: VideoSettleState, ctxTime: number) {
  for (const drift of SETTLE_DRIFT_GRID) {
    expect(settle.settleRate(ctxTime, drift)).toEqual({
      rate: videoRateCorrection(drift),
      settling: false,
    });
  }
}

describe('D-19a post-swap settle constants (R12-U)', () => {
  it('keeps the settle band, gain, rate band and cap inside the amended D-19a ranges', () => {
    expect(VIDEO_SETTLE_BAND_SECONDS).toBeLessThanOrEqual(0.008);
    expect(VIDEO_SETTLE_GAIN).toBeGreaterThanOrEqual(8);
    expect(VIDEO_SETTLE_GAIN).toBeLessThanOrEqual(9);
    expect(VIDEO_SETTLE_RATE_MAX).toBeLessThanOrEqual(1.45);
    expect(VIDEO_SETTLE_RATE_MAX).toBeLessThan(VIDEO_STALL_LAG_RATE);
    expect(VIDEO_SETTLE_RATE_MIN).toBeGreaterThanOrEqual(0.55);
    expect(VIDEO_SETTLE_RATE_MIN).toBeGreaterThan(VIDEO_STALL_LEAD_RATE);
    expect(VIDEO_SETTLE_MAX_SECONDS).toBe(1);
  });
});

describe('videoSettleRateCorrection (R12-U)', () => {
  it('returns exactly 1 inside the settle band', () => {
    for (const drift of [0, 0.0007, -0.0007, 0.005, -0.005, 0.008, -0.008, Number.NaN]) {
      expect(videoSettleRateCorrection(drift)).toBe(1);
    }
  });

  it('corrects just outside the settle band, where the steady rule still returns 1', () => {
    expect(videoSettleRateCorrection(-0.0081)).toBeGreaterThan(1);
    expect(videoSettleRateCorrection(0.0081)).toBeLessThan(1);
    expect(videoRateCorrection(-0.0081)).toBe(1);
  });

  it('is monotone non-increasing in the drift', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let drift = -1.2; drift <= 1.2; drift += 0.0007) {
      const rate = videoSettleRateCorrection(drift);
      expect(rate).toBeLessThanOrEqual(previous + 1e-12);
      previous = rate;
    }
  });

  it('never leaves [VIDEO_SETTLE_RATE_MIN, VIDEO_SETTLE_RATE_MAX] and uses the 0.05 step', () => {
    for (let drift = -3; drift <= 3; drift += 0.0013) {
      const rate = videoSettleRateCorrection(drift);
      expect(rate).toBeGreaterThanOrEqual(VIDEO_SETTLE_RATE_MIN);
      expect(rate).toBeLessThanOrEqual(VIDEO_SETTLE_RATE_MAX);
      expect(Math.round(rate * 100) % Math.round(VIDEO_RATE_STEP * 100)).toBe(0);
    }
    expect(videoSettleRateCorrection(-1)).toBe(VIDEO_SETTLE_RATE_MAX);
    expect(videoSettleRateCorrection(1)).toBe(VIDEO_SETTLE_RATE_MIN);
  });

  it('applies the settle gain: d = −0.02 is 4 steps faster, where the steady rule is 1', () => {
    expect(videoSettleRateCorrection(-0.02)).toBeCloseTo(1 + 4 * VIDEO_RATE_STEP, 12);
    expect(videoSettleRateCorrection(0.02)).toBeCloseTo(1 - 4 * VIDEO_RATE_STEP, 12);
    expect(videoRateCorrection(-0.02)).toBe(1);
  });
});

describe('createVideoSettleState (R12-U)', () => {
  it('equals the steady rule when it was never armed', () => {
    expectSteadyRule(createVideoSettleState(), 5);
  });

  it('does not end on an in-band first sample (d = −0.0007)', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    expect(settle.settleRate(10 + SETTLE_FRAME_SECONDS, -0.0007)).toEqual({
      rate: 1,
      settling: true,
    });
    expect(settle.settleRate(10 + 2 * SETTLE_FRAME_SECONDS, -0.0007).settling).toBe(true);
    expect(settle.settleRate(10 + 3 * SETTLE_FRAME_SECONDS, -0.02)).toEqual({
      rate: videoSettleRateCorrection(-0.02),
      settling: true,
    });
  });

  it('ends at the first in-band sample after |d| exceeded the band, then follows the steady rule', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    expect(settle.settleRate(10.02, -0.03).settling).toBe(true);
    expect(settle.settleRate(10.04, -0.009).settling).toBe(true);
    expect(settle.settleRate(10.06, -0.005)).toEqual({ rate: 1, settling: false });
    expectSteadyRule(settle, 10.08);
  });

  it('does not hunt after the end: a constant |d| of 0.012 gives rate 1', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    settle.settleRate(10.02, -0.03);
    settle.settleRate(10.04, -0.006);
    for (let index = 0; index < 60; index++) {
      const drift = index % 2 === 0 ? -0.012 : 0.012;
      expect(settle.settleRate(10.06 + index * SETTLE_FRAME_SECONDS, drift)).toEqual({
        rate: 1,
        settling: false,
      });
    }
  });

  it('ends at armedAt + VIDEO_SETTLE_MAX_SECONDS', () => {
    const settle = createVideoSettleState();
    const armedAt = 10.3;
    settle.armSettle(armedAt);
    for (let frame = 1; frame < 60; frame++) {
      expect(settle.settleRate(armedAt + frame / 60, -0.03).settling).toBe(true);
    }
    expect(settle.settleRate(armedAt + 60 / 60, -0.03)).toEqual({
      rate: videoRateCorrection(-0.03),
      settling: false,
    });
    expectSteadyRule(settle, armedAt + 0.5);
  });

  it('ends on endSettle()', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    expect(settle.settleRate(10.02, -0.03).settling).toBe(true);
    settle.endSettle();
    expectSteadyRule(settle, 10.04);
  });

  it('ends when the audio clock runs backwards', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    expect(settle.settleRate(10.02, -0.03).settling).toBe(true);
    expect(settle.settleRate(9.5, -0.03)).toEqual({
      rate: videoRateCorrection(-0.03),
      settling: false,
    });
    expectSteadyRule(settle, 10.04);
  });

  it('restarts on a new arm', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    settle.settleRate(10.02, -0.03);
    settle.settleRate(10.04, -0.004);
    settle.armSettle(12);
    expect(settle.settleRate(12.02, -0.004)).toEqual({ rate: 1, settling: true });
    expect(settle.settleRate(12.04, -0.03)).toEqual({
      rate: videoSettleRateCorrection(-0.03),
      settling: true,
    });
  });

  it('keeps D-24 priority: a steady stall-edge rate is written unchanged and settle continues', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    for (const drift of [-0.119, -0.12, -0.3, 0.119, 0.2]) {
      const result = settle.settleRate(10.02, drift);
      expect(result).toEqual({ rate: videoRateCorrection(drift), settling: true });
      expect(isVideoRateAtStallEdge({ ctxTime: 10.02, drift, rate: result.rate })).toBe(true);
    }
    expect(settle.settleRate(10.03, -0.11)).toEqual({
      rate: VIDEO_SETTLE_RATE_MAX,
      settling: true,
    });
    expect(settle.settleRate(10.04, 0.11)).toEqual({ rate: VIDEO_SETTLE_RATE_MIN, settling: true });
  });

  it('marks a sample as a stall edge under settle exactly when the steady rule does', () => {
    for (const drift of SETTLE_DRIFT_GRID) {
      const settle = createVideoSettleState();
      settle.armSettle(10);
      const { rate, settling } = settle.settleRate(10.02, drift);
      expect(settling).toBe(true);
      expect(isVideoRateAtStallEdge({ ctxTime: 10.02, drift, rate })).toBe(
        isVideoRateAtStallEdge({ ctxTime: 10.02, drift, rate: videoRateCorrection(drift) }),
      );
    }
  });

  it('keeps settling just below the cap', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10.3);
    expect(settle.settleRate(10.3 + VIDEO_SETTLE_MAX_SECONDS - 1e-6, -0.03).settling).toBe(true);
  });

  it('treats a NaN drift as neither leaving nor re-entering the band', () => {
    const settle = createVideoSettleState();
    settle.armSettle(10);
    expect(settle.settleRate(10.02, Number.NaN)).toEqual({ rate: 1, settling: true });
    settle.settleRate(10.04, -0.03);
    expect(settle.settleRate(10.06, Number.NaN)).toEqual({ rate: 1, settling: true });
    expect(settle.settleRate(10.08, -0.004)).toEqual({ rate: 1, settling: false });
  });
});

interface PostSwapSimulationInput {
  armSettle: boolean;
  freezeFrom: number;
  freezeSeconds: number;
  frames: number;
}

interface PostSwapSimulationFrame {
  at: number;
  drift: number;
  rate: number;
  settling: boolean;
  atStallEdge: boolean;
  escalates: boolean;
}

function simulatePostSwapSettle({
  armSettle,
  freezeFrom,
  freezeSeconds,
  frames,
}: PostSwapSimulationInput): PostSwapSimulationFrame[] {
  const swapCtx = 20;
  const settle = createVideoSettleState();
  const stall = createVideoStallWindow();
  if (armSettle) {
    settle.armSettle(swapCtx);
  }
  let videoPosition = 0;
  let appliedRate = 1;
  const result: PostSwapSimulationFrame[] = [];
  for (let index = 0; index < frames; index++) {
    const at = index / 60;
    const ctxTime = swapCtx + at;
    const drift = videoPosition - at;
    const { rate, settling } = settle.settleRate(ctxTime, drift);
    stall.pushStallSample({ ctxTime, drift, rate });
    result.push({
      at,
      drift,
      rate,
      settling,
      atStallEdge: isVideoRateAtStallEdge({ ctxTime, drift, rate }),
      escalates: stall.shouldEscalateStall(),
    });
    const next = (index + 1) / 60;
    const frozen = Math.max(
      0,
      Math.min(next, freezeFrom + freezeSeconds) - Math.max(at, freezeFrom),
    );
    videoPosition += appliedRate * (next - at - frozen);
    appliedRate = rate;
  }
  return result;
}

function firstFrameAtOrAfter(series: readonly PostSwapSimulationFrame[], at: number) {
  const frame = series.find((entry) => entry.at >= at - 1e-9);
  if (!frame) {
    throw new Error(`no simulated frame at or after ${at}`);
  }
  return frame;
}

describe('post-swap settle simulation (C-R7-01, R12-U)', () => {
  const decoderFreeze = { freezeFrom: 0.022, freezeSeconds: 0.03, frames: 90 };

  it('documents the bug: the steady rule alone leaves |d(+300 ms)| above 0.01', () => {
    const control = simulatePostSwapSettle({ armSettle: false, ...decoderFreeze });
    const landing = firstFrameAtOrAfter(control, 0.3);
    expect(Math.abs(landing.drift)).toBeGreaterThan(0.01);
    expect(control.every((frame) => !frame.settling)).toBe(true);
  });

  it('lands within 0.01 at +300 ms, never escalates and never exceeds VIDEO_SETTLE_RATE_MAX', () => {
    const series = simulatePostSwapSettle({ armSettle: true, ...decoderFreeze });
    const landing = firstFrameAtOrAfter(series, 0.3);
    expect(Math.abs(landing.drift)).toBeLessThanOrEqual(0.01);
    expect(landing.drift).toBeCloseTo(-0.006, 3);
    expect(series.some((frame) => frame.escalates)).toBe(false);
    expect(Math.max(...series.map((frame) => frame.rate))).toBeLessThanOrEqual(
      VIDEO_SETTLE_RATE_MAX,
    );
    const ended = series.findIndex((frame, index) => index > 0 && !frame.settling);
    expect(ended).toBeGreaterThan(0);
    expect(Math.abs(series[ended].drift)).toBeLessThanOrEqual(VIDEO_SETTLE_BAND_SECONDS);
    expect(series.slice(ended).every((frame) => !frame.settling && frame.rate === 1)).toBe(true);
  });

  it('keeps D-24 priority under a 400 ms post-swap freeze: escalation at the same frame as the steady control', () => {
    const freeze = { freezeFrom: 0.022, freezeSeconds: 0.4, frames: 90 };
    const control = simulatePostSwapSettle({ armSettle: false, ...freeze });
    const settled = simulatePostSwapSettle({ armSettle: true, ...freeze });
    const controlEscalation = control.findIndex((frame) => frame.escalates);
    expect(controlEscalation).toBeGreaterThan(0);
    expect(settled.findIndex((frame) => frame.escalates)).toBe(controlEscalation);
    for (let index = 0; index <= controlEscalation; index++) {
      if (control[index].atStallEdge) {
        expect(settled[index].atStallEdge).toBe(true);
      }
    }
  });
});
