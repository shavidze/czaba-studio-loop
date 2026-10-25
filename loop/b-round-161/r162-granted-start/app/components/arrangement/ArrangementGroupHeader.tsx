import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { GESTURE_EDIT_BLOCKED_MESSAGE, useArrangement } from '~/contexts/ArrangementContext';
import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';
import { FADER_SHIFT_FINE_DIVISOR } from '~/lib/arrangement/fader';
import {
  arrangementGroups,
  TRACK_GROUP_INDENT_PX,
  TRACK_GROUP_NAME_MAX_LENGTH,
  type TrackGroupOverviewClip,
  trackGroupSoloState,
  trackGroupVolume,
} from '~/lib/arrangement/groups';
import { studioGroupHeaderStrings, studioLaneStrings } from '~/lib/arrangement/strings';
import {
  formatTrackVolumeDb,
  TRACK_VOLUME_DB_DEFAULT,
  TRACK_VOLUME_DB_MAX,
  TRACK_VOLUME_DB_MIN,
  TRACK_VOLUME_DB_STEP,
  trackVolumeFromDb,
  trackVolumeSliderDb,
} from '~/lib/arrangement/track-volume-db';
import { cn } from '~/lib/utils';
import type { ArrangementTrackGroup } from '~/types/arrangement';
import {
  ARRANGEMENT_HEADER_WIDTH_PX,
  TRACK_HEADER_PADDING_X_PX,
  type TrackRowSelectModifiers,
} from './ArrangementLane';

export const TRACK_GROUP_ROW_HEIGHT_PX = 28;

const TRACK_GROUP_NAME_TITLE = studioGroupHeaderStrings.nameTitle;
const TRACK_GROUP_FOLD_TITLE = `${studioLaneStrings.foldTitle} (U)`;
const TRACK_GROUP_MIX_BUTTON_CLASS =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border text-xs font-medium leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

export interface TrackGroupOverviewBlock extends TrackGroupOverviewClip {
  selected: boolean;
}

interface ArrangementGroupHeaderProps {
  group: ArrangementTrackGroup;
  depth: number;
  selected: boolean;
  timelineWidth: number;
  collapsed: boolean;
  containsActive: boolean;
  overviewClips: readonly TrackGroupOverviewBlock[];
  pxPerSecond: number;
  onSelectGroup: (groupId: string, modifiers: TrackRowSelectModifiers) => void;
  onRenameGroup: (groupId: string, draft: string) => void;
  onToggleCollapse: (groupId: string) => void;
}

function trackGroupNameLabel(
  name: string,
  collapsed: boolean,
  clipCount: number,
  selected: boolean,
): string {
  const state = collapsed
    ? clipCount === 1
      ? studioGroupHeaderStrings.foldedOneClip
      : studioGroupHeaderStrings.foldedClips(clipCount)
    : '';
  return `${studioGroupHeaderStrings.nameLabel(name)}${state}${selected ? studioLaneStrings.selectedSuffix : ''}`;
}

export function ArrangementGroupHeader({
  group,
  depth,
  selected,
  timelineWidth,
  collapsed,
  containsActive,
  overviewClips,
  pxPerSecond,
  onSelectGroup,
  onRenameGroup,
  onToggleCollapse,
}: ArrangementGroupHeaderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const nameButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const settledRef = useRef(false);
  const restoreFocusRef = useRef(false);
  const volumeGestureStartRef = useRef<{ volume: number; sliderDb: number } | null>(null);
  const isEditing = draft !== null;
  const {
    arrangement,
    getArrangement,
    isPointerGestureActive,
    setStatus,
    toggleGroupMute,
    toggleGroupSolo,
    previewGroupVolume,
    commitGroupVolume,
    beginGroupVolumeGesture,
    blurGroupVolume,
  } = useArrangement();
  const soloState = trackGroupSoloState(arrangement, group.id);
  const volume = trackGroupVolume(group);
  const volumeText = formatTrackVolumeDb(volume);
  const muted = group.mute === true;

  const readStoredGroupVolume = () => {
    const stored = arrangementGroups(getArrangement()).find((entry) => entry.id === group.id);
    return stored ? trackGroupVolume(stored) : volume;
  };

  const groupVolumeFaderDrag = useRelativeFaderDrag({
    min: TRACK_VOLUME_DB_MIN,
    max: TRACK_VOLUME_DB_MAX,
    step: TRACK_VOLUME_DB_STEP,
    fineDivisor: FADER_SHIFT_FINE_DIVISOR,
    readStoredValue: () => trackVolumeSliderDb(readStoredGroupVolume()),
    isPointerGestureActive,
    beginGesture: (pointerId) => {
      if (!beginGroupVolumeGesture(group.id, pointerId)) {
        return false;
      }
      const startVolume = readStoredGroupVolume();
      volumeGestureStartRef.current = {
        volume: startVolume,
        sliderDb: trackVolumeSliderDb(startVolume),
      };
      return true;
    },
    previewValue: (sliderDb) => {
      const start = volumeGestureStartRef.current;
      previewGroupVolume(
        group.id,
        start && start.sliderDb === sliderDb ? start.volume : trackVolumeFromDb(sliderDb),
      );
    },
    refuseGesture: () => setStatus(GESTURE_EDIT_BLOCKED_MESSAGE),
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }
    if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      nameButtonRef.current?.focus({ preventScroll: true });
    }
  }, [isEditing]);

  const openEditor = () => {
    settledRef.current = false;
    setDraft(group.name);
  };

  const settleEditor = (reason: 'enter' | 'escape' | 'blur') => {
    if (settledRef.current || draft === null) {
      return;
    }
    settledRef.current = true;
    restoreFocusRef.current = reason !== 'blur';
    setDraft(null);
    if (reason !== 'escape') {
      onRenameGroup(group.id, draft);
    }
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'F2' || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) {
      openEditor();
    }
  };

  return (
    <div
      className="relative flex border-b border-outline"
      style={{ height: TRACK_GROUP_ROW_HEIGHT_PX }}
      data-group-id={group.id}
      data-group-depth={depth}
      data-group-selected={selected ? 'true' : undefined}
      data-group-collapsed={collapsed ? 'true' : undefined}
      data-contains-active={containsActive ? 'true' : undefined}
      data-testid="arrangement-group-row"
    >
      <div
        className={cn(
          'sticky left-0 z-20 flex shrink-0 items-center gap-0.5 border-r border-l-4 border-r-outline bg-elevated pr-2',
          containsActive ? 'border-l-brand' : 'border-l-transparent',
        )}
        style={{
          width: ARRANGEMENT_HEADER_WIDTH_PX,
          paddingLeft: TRACK_HEADER_PADDING_X_PX + depth * TRACK_GROUP_INDENT_PX,
        }}
        data-testid="arrangement-group-header"
      >
        <button
          type="button"
          onClick={() => onToggleCollapse(group.id)}
          onKeyDown={(event) => {
            if (event.key !== ' ') {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) {
              onToggleCollapse(group.id);
            }
          }}
          onKeyUp={(event) => {
            if (event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          aria-expanded={!collapsed}
          aria-label={studioGroupHeaderStrings.foldLabel(group.name)}
          title={TRACK_GROUP_FOLD_TITLE}
          className={cn(
            '-ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-sm leading-none text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
            collapsed ? "before:content-['▸']" : "before:content-['▾']",
          )}
          data-fold-glyph={collapsed ? '▸' : '▾'}
          data-testid="arrangement-group-fold"
        />
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            maxLength={TRACK_GROUP_NAME_MAX_LENGTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                settleEditor(event.key === 'Enter' ? 'enter' : 'escape');
              }
            }}
            onBlur={() => settleEditor('blur')}
            aria-label={studioGroupHeaderStrings.nameInputLabel(group.name)}
            className="h-6 min-w-0 flex-1 rounded-sm border border-brand bg-background px-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
            data-testid="arrangement-group-name-input"
          />
        ) : (
          <button
            ref={nameButtonRef}
            type="button"
            onClick={(event) =>
              onSelectGroup(group.id, {
                toggle: event.ctrlKey || event.metaKey,
                range: event.shiftKey,
              })
            }
            onKeyDown={handleNameKeyDown}
            aria-label={trackGroupNameLabel(group.name, collapsed, overviewClips.length, selected)}
            title={TRACK_GROUP_NAME_TITLE}
            className={cn(
              'flex h-6 min-w-0 flex-1 select-none items-center gap-1 truncate rounded-sm px-1 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
              selected ? 'bg-brand/20' : 'hover:bg-surface',
            )}
            data-testid="arrangement-group-name"
          >
            <span aria-hidden="true" className="text-xs text-muted">
              ▣
            </span>
            <span className="truncate">{group.name}</span>
          </button>
        )}
        <button
          type="button"
          aria-pressed={muted}
          aria-label={studioGroupHeaderStrings.muteLabel(group.name)}
          title="Mute"
          onClick={() => toggleGroupMute(group.id)}
          className={cn(
            TRACK_GROUP_MIX_BUTTON_CLASS,
            "before:content-['M']",
            muted
              ? 'border-accent bg-accent text-background'
              : 'border-outline text-muted hover:text-foreground',
          )}
          data-mute={muted ? 'on' : 'off'}
          data-testid="arrangement-group-mute"
        />
        <button
          type="button"
          aria-pressed={soloState === 'on' ? true : soloState === 'mixed' ? 'mixed' : false}
          aria-label={studioGroupHeaderStrings.soloLabel(group.name)}
          title={studioLaneStrings.soloTitle}
          onClick={(event) => toggleGroupSolo(group.id, event.ctrlKey || event.metaKey)}
          className={cn(
            TRACK_GROUP_MIX_BUTTON_CLASS,
            "before:content-['S']",
            soloState === 'on' && 'border-brand bg-brand text-brand-foreground',
            soloState === 'mixed' &&
              'border-brand bg-gradient-to-r from-brand from-50% to-transparent to-50% text-foreground',
            soloState === 'off' && 'border-outline text-muted hover:text-foreground',
          )}
          data-solo={soloState}
          data-testid="arrangement-group-solo"
        />
        <input
          ref={groupVolumeFaderDrag.ref}
          type="range"
          min={TRACK_VOLUME_DB_MIN}
          max={TRACK_VOLUME_DB_MAX}
          step={TRACK_VOLUME_DB_STEP}
          value={trackVolumeSliderDb(volume)}
          aria-label={studioGroupHeaderStrings.volumeLabel(group.name)}
          aria-valuetext={volumeText}
          title={`Volume ${volumeText}`}
          onChange={(event) =>
            previewGroupVolume(group.id, trackVolumeFromDb(Number(event.target.value)))
          }
          onPointerDown={groupVolumeFaderDrag.onPointerDown}
          onDoubleClick={() => {
            previewGroupVolume(group.id, trackVolumeFromDb(TRACK_VOLUME_DB_DEFAULT));
            commitGroupVolume(group.id);
          }}
          onPointerUp={() => commitGroupVolume(group.id)}
          onLostPointerCapture={() => commitGroupVolume(group.id)}
          onKeyUp={() => {
            if (!isPointerGestureActive()) {
              commitGroupVolume(group.id);
            }
          }}
          onBlur={() => blurGroupVolume(group.id)}
          className="h-1 w-12 min-w-12 shrink-0 touch-none accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          data-testid="arrangement-group-volume"
        />
      </div>
      {collapsed ? (
        <div
          className="pointer-events-none relative shrink-0"
          style={{ width: timelineWidth }}
          aria-hidden="true"
          data-testid="arrangement-group-overview"
        >
          {overviewClips.map((block) => (
            <div
              key={block.clipId}
              className={cn(
                'absolute inset-y-1 rounded-sm border',
                block.selected ? 'border-brand bg-brand/60' : 'border-outline-hover bg-brand/25',
              )}
              style={{
                left: block.start * pxPerSecond,
                width: Math.max(1, block.duration * pxPerSecond),
              }}
              data-overview-clip-id={block.clipId}
              data-overview-start={block.start.toFixed(3)}
              data-overview-end={(block.start + block.duration).toFixed(3)}
              data-overview-selected={block.selected ? 'true' : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="shrink-0" style={{ width: timelineWidth }} aria-hidden="true" />
      )}
    </div>
  );
}
