import { ChevronDown, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import {
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  formatArrangementTime,
  type SourceLoadState,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import {
  buildLibraryTree,
  filterLibrarySources,
  LIBRARY_ALL_NODE_ID,
  LIBRARY_DRAG_MIME,
  LIBRARY_KIND_LABELS,
  moveLibrarySelection,
  resolveLibraryNode,
} from '~/lib/arrangement/library';
import { studioLibraryPanelStrings, studioSourceLoadStrings } from '~/lib/arrangement/strings';
import { cn } from '~/lib/utils';
import type { WorkspaceSource } from '~/types/arrangement';
import { ArrangementLibraryPreview } from './ArrangementLibraryPreview';
import { STUDIO_SCROLLBAR_CLASS } from './studio-scrollbar';

export const LIBRARY_MIN_WIDTH_PX = 288;
export const LIBRARY_MAX_WIDTH_PX = 480;
export const LIBRARY_RAIL_WIDTH_PX = 40;
const LIBRARY_KEY_STEP_PX = 16;
const LIBRARY_EMPTY_MESSAGE = studioLibraryPanelStrings.noResults;

const treeNodeClass =
  'flex w-full min-w-0 items-start gap-1 border-l-2 py-1 pr-1 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand';

const treeLabelClass = 'min-w-0 break-words leading-snug';

function treeNodeStateClass(isActive: boolean): string {
  return isActive
    ? 'border-brand bg-brand/10 text-brand'
    : 'border-transparent text-muted hover:bg-elevated hover:text-foreground';
}

function clampLibraryWidth(width: number): number {
  return Math.min(LIBRARY_MAX_WIDTH_PX, Math.max(LIBRARY_MIN_WIDTH_PX, Math.round(width)));
}

interface ArrangementLibraryOptionProps {
  source: WorkspaceSource;
  state: SourceLoadState | undefined;
  isSelected: boolean;
  isFocusTarget: boolean;
  isPreviewing: boolean;
  onSelect: (sourceId: string) => void;
  onAdd: (sourceId: string) => void;
  onOptionKeyDown: (event: KeyboardEvent<HTMLButtonElement>, sourceId: string) => void;
  onOptionDragStart: (event: DragEvent<HTMLButtonElement>, sourceId: string) => void;
  onOptionDragEnd: () => void;
  registerOption: (sourceId: string, element: HTMLButtonElement | null) => void;
}

function ArrangementLibraryOptionInner({
  source,
  state,
  isSelected,
  isFocusTarget,
  isPreviewing,
  onSelect,
  onAdd,
  onOptionKeyDown,
  onOptionDragStart,
  onOptionDragEnd,
  registerOption,
}: ArrangementLibraryOptionProps) {
  return (
    <button
      ref={(element) => registerOption(source.id, element)}
      type="button"
      role="option"
      aria-selected={isSelected}
      tabIndex={isFocusTarget ? 0 : -1}
      draggable={state?.status === 'ready'}
      onClick={() => onSelect(source.id)}
      onDoubleClick={() => onAdd(source.id)}
      onKeyDown={(event) => onOptionKeyDown(event, source.id)}
      onDragStart={(event) => onOptionDragStart(event, source.id)}
      onDragEnd={onOptionDragEnd}
      title={source.title}
      className={cn(
        'flex w-full flex-col rounded-md px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand',
        isSelected ? 'bg-brand/10' : 'hover:bg-elevated',
      )}
      data-source-id={source.id}
    >
      <span
        className="w-full break-words text-sm leading-snug text-foreground"
        data-testid="arrangement-library-option-title"
      >
        {source.shortTitle ?? source.title}
      </span>
      {source.shortTitle ? (
        <span
          className="w-full break-words text-xs leading-snug text-muted"
          data-testid="arrangement-library-option-context"
        >
          {source.collectionLabel}
        </span>
      ) : null}
      <span className="flex gap-2 text-xs tabular-nums text-muted">
        <span>{LIBRARY_KIND_LABELS[source.kind]}</span>
        <span>
          {!state || state.status === 'loading' ? (
            studioSourceLoadStrings.rowLoading
          ) : state.status === 'error' ? (
            studioSourceLoadStrings.rowError(state.error ?? '')
          ) : (
            <span className="font-mono">{formatArrangementTime(state.duration)}</span>
          )}
        </span>
      </span>
      {isPreviewing ? (
        <span
          className="flex items-center gap-0.5 whitespace-nowrap text-xs text-foreground"
          data-testid="arrangement-library-option-previewing"
        >
          <Play className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
          <span>{studioSourceLoadStrings.rowPreviewing}</span>
        </span>
      ) : null}
    </button>
  );
}

const ArrangementLibraryOption = memo(ArrangementLibraryOptionInner);

interface ArrangementLibraryProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  asideRef?: RefObject<HTMLElement>;
  bodyRef?: RefObject<HTMLDivElement>;
  bottomInsetPx?: number;
}

export function ArrangementLibrary({
  isCollapsed,
  onCollapsedChange,
  asideRef,
  bodyRef,
  bottomInsetPx = 0,
}: ArrangementLibraryProps) {
  const {
    collection,
    sourceStates,
    selectedSourceId,
    libraryPreviewSourceId,
    selectSource,
    addSourceToActiveTrack,
    startLibraryPreview,
    stopLibraryPreview,
    beginLibraryDrag,
    endLibraryDrag,
  } = useArrangement();
  const tree = useMemo(() => buildLibraryTree(collection.sources), [collection.sources]);
  const [nodeId, setNodeId] = useState(LIBRARY_ALL_NODE_ID);
  const [collapsedCollections, setCollapsedCollections] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [query, setQuery] = useState('');
  const [width, setWidth] = useState(LIBRARY_MIN_WIDTH_PX);
  const [isResizing, setIsResizing] = useState(false);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const libraryExpandButtonRef = useRef<HTMLButtonElement>(null);
  const libraryCollapseButtonRef = useRef<HTMLButtonElement>(null);
  const librarySearchInputRef = useRef<HTMLInputElement>(null);
  const libraryToggleFocusRef = useRef<'expand' | 'collapse' | null>(null);
  const node = useMemo(() => resolveLibraryNode(tree, nodeId), [tree, nodeId]);
  const results = useMemo(
    () => filterLibrarySources(collection.sources, node, query),
    [collection.sources, node, query],
  );
  const resultIds = useMemo(() => results.map((source) => source.id), [results]);
  const visibleSelectedId =
    selectedSourceId !== null && resultIds.includes(selectedSourceId) ? selectedSourceId : null;
  const activeNodeLabel =
    nodeId === LIBRARY_ALL_NODE_ID
      ? null
      : (tree.collections.find((entry) => entry.id === nodeId)?.label ??
        tree.collections.flatMap((entry) => entry.folders).find((folder) => folder.id === nodeId)
          ?.label ??
        null);
  const bottomInsetStyle =
    bottomInsetPx > 0
      ? { paddingBottom: bottomInsetPx, scrollPaddingBottom: bottomInsetPx }
      : undefined;

  useEffect(() => () => resizeCleanupRef.current?.(), []);

  useIsomorphicLayoutEffect(() => {
    const partnerKind = libraryToggleFocusRef.current;
    libraryToggleFocusRef.current = null;
    if (!partnerKind) {
      return;
    }
    const partner =
      partnerKind === 'expand' ? libraryExpandButtonRef.current : libraryCollapseButtonRef.current;
    const activeElement = document.activeElement;
    if (partner?.isConnected && (activeElement === null || activeElement === document.body)) {
      partner.focus({ preventScroll: true });
    }
  });

  const changeLibraryCollapsedFromToggle = (
    event: MouseEvent<HTMLButtonElement>,
    collapsed: boolean,
  ) => {
    libraryToggleFocusRef.current =
      document.activeElement === event.currentTarget ? (collapsed ? 'expand' : 'collapse') : null;
    onCollapsedChange(collapsed);
  };

  const clearLibrarySearch = (event: MouseEvent<HTMLButtonElement>) => {
    const hadFocus = document.activeElement === event.currentTarget;
    setQuery('');
    if (hadFocus) {
      librarySearchInputRef.current?.focus();
    }
  };

  const preventRepeatedLibraryEnter = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' && event.repeat) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (
      libraryPreviewSourceId !== null &&
      (isCollapsed || !resultIds.includes(libraryPreviewSourceId))
    ) {
      stopLibraryPreview();
    }
  }, [isCollapsed, libraryPreviewSourceId, resultIds, stopLibraryPreview]);

  const focusLibraryOption = useCallback((sourceId: string) => {
    requestAnimationFrame(() => optionRefs.current.get(sourceId)?.focus());
  }, []);

  const selectLibraryOption = (sourceId: string | null, focus: boolean) => {
    if (!sourceId) {
      return;
    }
    selectSource(sourceId);
    if (focus) {
      focusLibraryOption(sourceId);
    }
    if (libraryPreviewSourceId !== null && libraryPreviewSourceId !== sourceId) {
      startLibraryPreview(sourceId, 0);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectLibraryOption(resultIds[0] ?? null, true);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setQuery('');
    }
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, sourceId: string) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      selectLibraryOption(
        moveLibrarySelection(resultIds, sourceId, event.key === 'ArrowDown' ? 1 : -1),
        true,
      );
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.stopPropagation();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        selectSource(sourceId);
        addSourceToActiveTrack(sourceId);
      }
    }
  };

  const handleOptionDragStart = (event: DragEvent<HTMLButtonElement>, sourceId: string) => {
    event.dataTransfer.setData(LIBRARY_DRAG_MIME, sourceId);
    event.dataTransfer.effectAllowed = 'copy';
    selectSource(sourceId);
    beginLibraryDrag(sourceId);
  };

  const optionHandlersRef = useRef({
    selectLibraryOption,
    handleOptionKeyDown,
    handleOptionDragStart,
    addSourceToActiveTrack,
  });
  optionHandlersRef.current = {
    selectLibraryOption,
    handleOptionKeyDown,
    handleOptionDragStart,
    addSourceToActiveTrack,
  };

  const handleOptionSelect = useCallback((sourceId: string) => {
    optionHandlersRef.current.selectLibraryOption(sourceId, false);
  }, []);

  const handleOptionAdd = useCallback((sourceId: string) => {
    optionHandlersRef.current.addSourceToActiveTrack(sourceId);
  }, []);

  const handleOptionKeyDownStable = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, sourceId: string) => {
      optionHandlersRef.current.handleOptionKeyDown(event, sourceId);
    },
    [],
  );

  const handleOptionDragStartStable = useCallback(
    (event: DragEvent<HTMLButtonElement>, sourceId: string) => {
      optionHandlersRef.current.handleOptionDragStart(event, sourceId);
    },
    [],
  );

  const registerLibraryOption = useCallback(
    (sourceId: string, element: HTMLButtonElement | null) => {
      if (element) {
        optionRefs.current.set(sourceId, element);
      } else {
        optionRefs.current.delete(sourceId);
      }
    },
    [],
  );

  const toggleCollection = (collectionId: string) => {
    setCollapsedCollections((current) => {
      const next = new Set(current);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const handleSeparatorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setWidth((current) =>
      clampLibraryWidth(current + (event.key === 'ArrowLeft' ? -1 : 1) * LIBRARY_KEY_STEP_PX),
    );
  };

  const handleSeparatorPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.focus();
    resizeCleanupRef.current?.();
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = width;
    const handleMove = (move: globalThis.PointerEvent) => {
      if (move.pointerId === pointerId) {
        setWidth(clampLibraryWidth(startWidth + move.clientX - startX));
      }
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      resizeCleanupRef.current = null;
      setIsResizing(false);
    };
    const finish = (end: globalThis.PointerEvent) => {
      if (end.pointerId === pointerId) {
        cleanup();
      }
    };
    setIsResizing(true);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    resizeCleanupRef.current = cleanup;
  };

  return (
    <aside
      ref={asideRef}
      aria-label={studioLibraryPanelStrings.library}
      className={cn(
        'relative flex shrink-0 flex-col overflow-hidden border-r border-outline bg-surface',
        !isResizing && 'transition-[width] duration-300 motion-reduce:transition-none',
      )}
      style={{ width: isCollapsed ? LIBRARY_RAIL_WIDTH_PX : width }}
      data-testid="arrangement-library"
      data-collapsed={isCollapsed ? 'true' : 'false'}
    >
      {isCollapsed ? (
        <div className="flex flex-col items-center py-2">
          <button
            ref={libraryExpandButtonRef}
            type="button"
            onClick={(event) => changeLibraryCollapsedFromToggle(event, false)}
            onKeyDown={preventRepeatedLibraryEnter}
            aria-label={studioLibraryPanelStrings.expand}
            title={studioLibraryPanelStrings.expand}
            className="flex items-center justify-center h-8 w-8 rounded-md text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            data-testid="arrangement-library-expand"
          >
            <ChevronRight className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 w-full min-w-72 flex-1 flex-col">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-outline px-3">
            <h2 className="text-sm font-medium text-foreground">
              {studioLibraryPanelStrings.library}
            </h2>
            <button
              ref={libraryCollapseButtonRef}
              type="button"
              onClick={(event) => changeLibraryCollapsedFromToggle(event, true)}
              onKeyDown={preventRepeatedLibraryEnter}
              aria-label={studioLibraryPanelStrings.collapse}
              title={studioLibraryPanelStrings.collapse}
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              data-testid="arrangement-library-collapse"
            >
              <ChevronLeft className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className="shrink-0 space-y-1.5 border-b border-outline p-3">
            <div className="relative">
              <input
                ref={librarySearchInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={studioLibraryPanelStrings.searchPlaceholder}
                aria-label={studioLibraryPanelStrings.searchLabel}
                className="w-full rounded-md border border-outline-strong bg-background py-1.5 pr-7 pl-2 text-xs text-foreground placeholder:text-dim focus:border-brand focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                data-testid="arrangement-library-search"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearLibrarySearch}
                  onKeyDown={preventRepeatedLibraryEnter}
                  aria-label={studioLibraryPanelStrings.clearSearch}
                  className="flex items-center justify-center absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-md text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="arrangement-library-search-clear"
                >
                  <X className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {activeNodeLabel ? (
              <p className="truncate text-xs text-muted" data-testid="arrangement-library-filter">
                {studioLibraryPanelStrings.filterPrefix}
                <span className="text-foreground">{activeNodeLabel}</span>
              </p>
            ) : null}
            {collection.notice ? (
              <p className="text-xs text-muted" data-testid="arrangement-library-notice">
                {collection.notice}
              </p>
            ) : null}
          </div>
          <div ref={bodyRef} className="flex min-h-0 flex-1">
            <nav
              aria-label={studioLibraryPanelStrings.sidebarLabel}
              className={cn(
                'w-36 shrink-0 overflow-y-auto border-r border-outline py-1 text-xs',
                STUDIO_SCROLLBAR_CLASS,
              )}
              style={bottomInsetStyle}
              data-testid="arrangement-library-tree"
            >
              <button
                type="button"
                onClick={() => setNodeId(LIBRARY_ALL_NODE_ID)}
                aria-current={nodeId === LIBRARY_ALL_NODE_ID ? 'true' : undefined}
                className={cn(
                  treeNodeClass,
                  'pl-2',
                  treeNodeStateClass(nodeId === LIBRARY_ALL_NODE_ID),
                )}
              >
                <span className={treeLabelClass}>{studioLibraryPanelStrings.all}</span>
                <span className="ml-auto shrink-0 tabular-nums text-dim">{tree.total}</span>
              </button>
              {tree.collections.map((entry) => {
                const isExpanded = !collapsedCollections.has(entry.id);
                return (
                  <div key={entry.id}>
                    <div className="flex items-stretch">
                      <button
                        type="button"
                        onClick={() => toggleCollection(entry.id)}
                        aria-expanded={isExpanded}
                        aria-label={`${entry.label} — ${isExpanded ? studioLibraryPanelStrings.fold : studioLibraryPanelStrings.unfold}`}
                        className="flex items-center justify-center w-4 shrink-0 text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand"
                      >
                        {isExpanded ? (
                          <ChevronDown
                            className="size-2.5 shrink-0"
                            strokeWidth={2.4}
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRight
                            className="size-2.5 shrink-0"
                            strokeWidth={2.4}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNodeId(entry.id)}
                        aria-current={nodeId === entry.id ? 'true' : undefined}
                        title={entry.label}
                        className={cn(treeNodeClass, treeNodeStateClass(nodeId === entry.id))}
                      >
                        <span className={treeLabelClass}>{entry.label}</span>
                      </button>
                    </div>
                    {isExpanded
                      ? entry.folders.map((folder) => (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => setNodeId(folder.id)}
                            aria-current={nodeId === folder.id ? 'true' : undefined}
                            className={cn(
                              treeNodeClass,
                              'pl-4',
                              treeNodeStateClass(nodeId === folder.id),
                            )}
                            data-testid="arrangement-library-folder"
                          >
                            <span className={treeLabelClass}>{folder.label}</span>
                            <span className="ml-auto shrink-0 tabular-nums text-dim">
                              {folder.count}
                            </span>
                          </button>
                        ))
                      : null}
                  </div>
                );
              })}
            </nav>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {results.length === 0 ? (
                <output
                  className="block px-2 py-6 text-center text-xs text-muted"
                  data-testid="arrangement-library-empty"
                >
                  {LIBRARY_EMPTY_MESSAGE}
                </output>
              ) : null}
              <div
                role="listbox"
                aria-label={studioLibraryPanelStrings.listLabel}
                className={cn('min-h-0 min-w-0 flex-1 overflow-y-auto p-1', STUDIO_SCROLLBAR_CLASS)}
                style={bottomInsetStyle}
                data-testid="arrangement-library-list"
              >
                {results.map((source, index) => {
                  const isSelected = source.id === visibleSelectedId;
                  return (
                    <ArrangementLibraryOption
                      key={source.id}
                      source={source}
                      state={sourceStates[source.id]}
                      isSelected={isSelected}
                      isFocusTarget={isSelected || (visibleSelectedId === null && index === 0)}
                      isPreviewing={libraryPreviewSourceId === source.id}
                      onSelect={handleOptionSelect}
                      onAdd={handleOptionAdd}
                      onOptionKeyDown={handleOptionKeyDownStable}
                      onOptionDragStart={handleOptionDragStartStable}
                      onOptionDragEnd={endLibraryDrag}
                      registerOption={registerLibraryOption}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <ArrangementLibraryPreview sourceId={visibleSelectedId} />
        </div>
      )}
      {isCollapsed ? null : (
        // biome-ignore lint/a11y/useSemanticElements: a focusable resize handle needs role=separator with aria-valuenow; a native <hr> is a static, non-interactive separator
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={studioLibraryPanelStrings.widthLabel}
          aria-valuenow={width}
          aria-valuemin={LIBRARY_MIN_WIDTH_PX}
          aria-valuemax={LIBRARY_MAX_WIDTH_PX}
          tabIndex={0}
          onKeyDown={handleSeparatorKeyDown}
          onPointerDown={handleSeparatorPointerDown}
          className="absolute top-0 right-0 bottom-0 z-30 w-1 cursor-col-resize touch-none bg-outline hover:bg-foreground/50 focus-visible:bg-brand focus-visible:outline-none"
          data-testid="arrangement-library-separator"
        />
      )}
    </aside>
  );
}
