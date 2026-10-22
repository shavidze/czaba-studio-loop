import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { TRACK_GROUP_INDENT_PX, TRACK_GROUP_NAME_MAX_LENGTH } from '~/lib/arrangement/groups';
import { cn } from '~/lib/utils';
import type { ArrangementTrackGroup } from '~/types/arrangement';
import {
  ARRANGEMENT_HEADER_WIDTH_PX,
  TRACK_HEADER_PADDING_X_PX,
  type TrackRowSelectModifiers,
} from './ArrangementLane';

export const TRACK_GROUP_ROW_HEIGHT_PX = 28;

const TRACK_GROUP_NAME_TITLE = 'F2: სახელის შეცვლა · Ctrl+G: დაჯგუფება · Ctrl+Shift+G: დაშლა';

interface ArrangementGroupHeaderProps {
  group: ArrangementTrackGroup;
  depth: number;
  selected: boolean;
  timelineWidth: number;
  onSelectGroup: (groupId: string, modifiers: TrackRowSelectModifiers) => void;
  onRenameGroup: (groupId: string, draft: string) => void;
}

export function ArrangementGroupHeader({
  group,
  depth,
  selected,
  timelineWidth,
  onSelectGroup,
  onRenameGroup,
}: ArrangementGroupHeaderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const nameButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const settledRef = useRef(false);
  const restoreFocusRef = useRef(false);
  const isEditing = draft !== null;

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
      data-testid="arrangement-group-row"
    >
      <div
        className="sticky left-0 z-20 flex shrink-0 items-center border-r border-l-4 border-r-outline border-l-transparent bg-elevated pr-2"
        style={{
          width: ARRANGEMENT_HEADER_WIDTH_PX,
          paddingLeft: TRACK_HEADER_PADDING_X_PX + depth * TRACK_GROUP_INDENT_PX,
        }}
        data-testid="arrangement-group-header"
      >
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
            aria-label={`ჯგუფის სახელი — ${group.name}`}
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
            aria-label={`${group.name} — ჯგუფი${selected ? ', მონიშნული' : ''}`}
            title={TRACK_GROUP_NAME_TITLE}
            className={cn(
              'flex h-6 min-w-0 flex-1 select-none items-center gap-1 truncate rounded-sm px-1 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand',
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
      </div>
      <div className="shrink-0" style={{ width: timelineWidth }} aria-hidden="true" />
    </div>
  );
}
