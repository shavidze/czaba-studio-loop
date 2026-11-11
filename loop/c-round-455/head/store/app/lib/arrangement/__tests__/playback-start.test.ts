import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementLoop } from '~/types/arrangement';
import { type ArrangementTrackSeed, createArrangement } from '../model';
import {
  insertMarkerStatusKind,
  resolvePlaybackStart,
  resolveSpaceStartPoint,
} from '../playback-start';
import { studioPlaybackStrings, studioViewStrings } from '../strings';

const pb = studioPlaybackStrings;

function pbTracks(): ArrangementTrackSeed[] {
  return [
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ];
}

function sixteenSecondArrangement(loop: ArrangementLoop | null = null): Arrangement {
  const base = createArrangement(pbTracks());
  return {
    ...base,
    loop,
    clips: [
      { id: 'c1', trackId: 'music', sourceId: 'pulse', start: 0, sourceOffset: 0, duration: 16 },
    ],
  };
}

describe('SYS-6 playback-start resolver (D-29z594, D-29z599)', () => {
  it('PBS1 an empty arrangement resolves to empty', () => {
    const empty = createArrangement(pbTracks());
    expect(
      resolvePlaybackStart({ requested: 0, arrangement: empty, playbackEndedAt: null }),
    ).toEqual({ kind: 'empty' });
  });

  it('PBS2 a request past the end without a loop is refused as past-end', () => {
    expect(
      resolvePlaybackStart({
        requested: 17,
        arrangement: sixteenSecondArrangement(),
        playbackEndedAt: null,
      }),
    ).toEqual({ kind: 'past-end', requested: 17, end: 16 });
  });

  it('PBS3 a request at the end (or within EPS of it) plays from 0', () => {
    const arrangement = sixteenSecondArrangement();
    expect(resolvePlaybackStart({ requested: 16, arrangement, playbackEndedAt: null })).toEqual({
      kind: 'play',
      requested: 16,
      from: 0,
    });
    expect(
      resolvePlaybackStart({ requested: 15.99995, arrangement, playbackEndedAt: null }),
    ).toEqual({ kind: 'play', requested: 15.99995, from: 0 });
  });

  it('PBS4 a request inside the project plays from the request', () => {
    expect(
      resolvePlaybackStart({
        requested: 4,
        arrangement: sixteenSecondArrangement(),
        playbackEndedAt: null,
      }),
    ).toEqual({ kind: 'play', requested: 4, from: 4 });
  });

  it('PBS5 a request past the end inside an enabled loop plays from the request', () => {
    const arrangement = sixteenSecondArrangement({ start: 16.5, end: 18, enabled: true });
    expect(resolvePlaybackStart({ requested: 17, arrangement, playbackEndedAt: null })).toEqual({
      kind: 'play',
      requested: 17,
      from: 17,
    });
  });

  it('PBS6 a request where playback ended (endedHere) plays from 0', () => {
    expect(
      resolvePlaybackStart({
        requested: 17,
        arrangement: sixteenSecondArrangement(),
        playbackEndedAt: 17,
      }),
    ).toEqual({ kind: 'play', requested: 17, from: 0 });
  });

  it('PBS7 the Space start point is the selection start when a range exists, else the insert marker', () => {
    expect(resolveSpaceStartPoint({ insertMarker: 9, range: { start: 6, end: 2 } })).toEqual({
      origin: 'selection',
      requested: 2,
    });
    expect(resolveSpaceStartPoint({ insertMarker: 9, range: null })).toEqual({
      origin: 'insert-marker',
      requested: 9,
    });
  });

  it('PBS8 insertMarkerStatusKind classifies exactly the texts that name the insert marker', () => {
    const insertMarkerPastEnd = pb.playPastEnd({
      subject: pb.startPointInsertMarker,
      position: '00:17.000',
      end: '00:16.000',
    });
    const insertMarkerAtEnd = pb.playPastEnd({
      subject: pb.startPointInsertMarker,
      position: '00:16.000',
      end: '00:16.000',
    });
    const selectionPastEnd = pb.playPastEnd({
      subject: pb.startPointSelection,
      position: '00:17.000',
      end: '00:16.000',
    });
    const selectionAtEnd = pb.playPastEnd({
      subject: pb.startPointSelection,
      position: '00:16.000',
      end: '00:16.000',
    });
    expect(insertMarkerPastEnd).toContain('is past the end of the project (00:16.000)');
    expect(insertMarkerAtEnd).toContain('is at the end of the project');
    const kinds: Array<[string, ReturnType<typeof insertMarkerStatusKind>]> = [
      [pb.insertMarkerWhilePlaying('00:04.000'), 'playing'],
      [pb.insertMarkerWhilePlayingFollowPaused('00:04.000'), 'playing-follow-paused'],
      [pb.insertMarkerAfterStop('00:04.000'), 'stopped'],
      [pb.insertMarkerAfterStopFromStart('00:16.000'), 'stopped'],
      [pb.selectionAfterStop('00:02.000'), 'stopped'],
      [pb.insertMarkerToPlayhead('00:03.483'), 'stopped'],
      [insertMarkerPastEnd, 'stopped'],
      [insertMarkerAtEnd, 'stopped'],
      [selectionPastEnd, 'stopped'],
      [selectionAtEnd, 'stopped'],
      [pb.playingFrom('00:04.000'), 'playing-from'],
    ];
    for (const [text, kind] of kinds) {
      expect(insertMarkerStatusKind(text)).toBe(kind);
    }
    const outside = [
      studioViewStrings.followPaused,
      studioViewStrings.followResumed,
      pb.playPastEnd({ subject: pb.startPointPlayhead, position: '00:17.000', end: '00:16.000' }),
      pb.nothingToPlay,
      'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',
      '',
    ];
    for (const text of outside) {
      expect(insertMarkerStatusKind(text)).toBeNull();
    }
    for (const [text] of kinds) {
      const changed = `${text.slice(0, 2)}${text[2] === 'x' ? 'y' : 'x'}${text.slice(3)}`;
      expect(insertMarkerStatusKind(changed)).toBeNull();
      expect(insertMarkerStatusKind(`${text.slice(0, -1)}!`)).toBeNull();
    }
    expect(
      insertMarkerStatusKind(
        pb.insertMarkerAfterStopFromStart('00:16.000').replace('00:00.000', '00:05.000'),
      ),
    ).toBeNull();
    expect(insertMarkerStatusKind(insertMarkerPastEnd.replace('00:16.000', '00:16.001'))).toBe(
      'stopped',
    );
    expect(
      insertMarkerStatusKind(
        pb
          .playPastEnd({
            subject: pb.startPointInsertMarker,
            position: '00:16.000',
            end: '00:16.000',
          })
          .replace('at the end', 'past the end'),
      ),
    ).toBeNull();
  });

  it('PBS9 insertMarkerStatusKind classifies playingFrom and the selection past-end forms, not the playhead forms', () => {
    const playing = pb.playingFrom('00:04.000');
    expect(playing).toBe('Playing from 00:04.000.');
    expect(insertMarkerStatusKind(playing)).toBe('playing-from');
    for (const [position, end] of [
      ['00:17.000', '00:16.000'],
      ['00:16.000', '00:16.000'],
    ]) {
      expect(
        insertMarkerStatusKind(pb.playPastEnd({ subject: pb.startPointSelection, position, end })),
      ).toBe('stopped');
      expect(
        insertMarkerStatusKind(pb.playPastEnd({ subject: pb.startPointPlayhead, position, end })),
      ).toBeNull();
    }
    expect(insertMarkerStatusKind('Playing from 00:04.000!')).toBeNull();
    expect(insertMarkerStatusKind('Playing frum 00:04.000.')).toBeNull();
  });
});
