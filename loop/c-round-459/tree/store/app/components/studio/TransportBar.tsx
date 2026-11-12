import { Repeat, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStudio } from '~/contexts/StudioContext';

export function TransportBar() {
  const {
    state,
    seek,
    zoomLevel,
    setZoomLevel,
    loopRegion,
    loopEnabled,
    setLoopRegion,
    setLoopEnabled,
    toggleLoopEnabled,
  } = useStudio();

  // Helper: Create loop and seek to start
  const createLoopAndSeek = (start: number, end: number) => {
    setLoopRegion({ start, end });
    setLoopEnabled(true);
    seek(start); // Jump cursor to loop start
  };
  const timelineRef = useRef<HTMLDivElement>(null);

  // Zoom Drag State (Ableton-style: drag down = zoom in, drag up = zoom out)
  const [isZoomDragging, setIsZoomDragging] = useState(false);
  const zoomDragStartRef = useRef<{ y: number; initialZoom: number }>({ y: 0, initialZoom: 1 });
  const wasZoomDragRef = useRef(false); // Track if actual zoom drag happened (to prevent seek)

  // Loop Zone: Drag-to-create-loop state
  const [isLoopZoneDragging, setIsLoopZoneDragging] = useState(false);
  const [loopZoneDragStart, setLoopZoneDragStart] = useState<number | null>(null);
  const [loopZoneDragEnd, setLoopZoneDragEnd] = useState<number | null>(null);

  // Loop brace drag state (for existing brace manipulation)
  const [loopDragType, setLoopDragType] = useState<'start' | 'end' | 'body' | null>(null);
  const loopDragStartRef = useRef<{ time: number; loopStart: number; loopEnd: number }>({
    time: 0,
    loopStart: 0,
    loopEnd: 0,
  });

  // Format time as MM:SS:ms
  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return '00:00:000';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  };

  // Convert mouse position to time
  const getTimeFromMouseEvent = (e: MouseEvent | React.MouseEvent, rect?: DOMRect): number => {
    const r = rect || timelineRef.current?.getBoundingClientRect();
    if (!r) return 0;
    const x = e.clientX - r.left;
    const percentage = Math.max(0, Math.min(1, x / r.width));
    return percentage * state.masterDuration;
  };

  // Store mouse start position for detecting drag vs click
  const dragStartXRef = useRef<number>(0);

  // ==========================================
  // SEEK ZONE HANDLERS (bottom part of ruler)
  // ==========================================

  const handleSeekZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.allLoaded || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickTime = getTimeFromMouseEvent(e, rect);
    seek(clickTime);
  };

  // ==========================================
  // LOOP ZONE HANDLERS (top part of ruler)
  // ==========================================

  const handleLoopZoneMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.allLoaded || !timelineRef.current) return;
    e.preventDefault(); // Prevent accidental clicks on elements below

    const rect = timelineRef.current.getBoundingClientRect();
    const startTime = getTimeFromMouseEvent(e, rect);

    dragStartXRef.current = e.clientX;
    setIsLoopZoneDragging(true);
    setLoopZoneDragStart(startTime);
    setLoopZoneDragEnd(startTime);
  };

  const handleLoopZoneMouseMove = (e: MouseEvent) => {
    if (!isLoopZoneDragging || !timelineRef.current || !state.allLoaded) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const currentTime = getTimeFromMouseEvent(e, rect);
    setLoopZoneDragEnd(currentTime);
  };

  const handleLoopZoneMouseUp = (e: MouseEvent) => {
    if (!timelineRef.current) {
      setIsLoopZoneDragging(false);
      setLoopZoneDragStart(null);
      setLoopZoneDragEnd(null);
      return;
    }

    const dragDistance = Math.abs(e.clientX - dragStartXRef.current);

    if (dragDistance > 10 && loopZoneDragStart !== null && loopZoneDragEnd !== null) {
      // Was a drag - create new loop region and seek to start
      const startTime = Math.min(loopZoneDragStart, loopZoneDragEnd);
      const endTime = Math.max(loopZoneDragStart, loopZoneDragEnd);

      if (endTime - startTime > 0.2) {
        createLoopAndSeek(startTime, endTime);
      }
    } else {
      // Was a click - clear loop region (but don't disable loop switch)
      setLoopRegion({ start: 0, end: 0 });
    }

    setIsLoopZoneDragging(false);
    setLoopZoneDragStart(null);
    setLoopZoneDragEnd(null);
  };

  // Loop Zone global mouse listeners
  useEffect(() => {
    if (isLoopZoneDragging) {
      window.addEventListener('mousemove', handleLoopZoneMouseMove);
      window.addEventListener('mouseup', handleLoopZoneMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleLoopZoneMouseMove);
        window.removeEventListener('mouseup', handleLoopZoneMouseUp);
      };
    }
  }, [isLoopZoneDragging, handleLoopZoneMouseMove, handleLoopZoneMouseUp]);

  // ==========================================
  // LOOP BRACE HANDLERS (Ableton-style)
  // ==========================================

  const handleLoopBraceMouseDown = (e: React.MouseEvent, type: 'start' | 'end' | 'body') => {
    e.stopPropagation(); // Prevent timeline seek
    e.preventDefault(); // Prevent accidental clicks on elements below
    if (!state.allLoaded || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const time = getTimeFromMouseEvent(e, rect);

    setLoopDragType(type);
    loopDragStartRef.current = {
      time,
      loopStart: loopRegion.start,
      loopEnd: loopRegion.end,
    };
  };

  // Global handlers for loop brace dragging
  useEffect(() => {
    if (!loopDragType || !timelineRef.current) return;

    const handleLoopMouseMove = (e: MouseEvent) => {
      const rect = timelineRef.current!.getBoundingClientRect();
      const currentTime = getTimeFromMouseEvent(e, rect);
      const delta = currentTime - loopDragStartRef.current.time;

      if (loopDragType === 'start') {
        // Drag loop start
        const newStart = Math.max(
          0,
          Math.min(loopDragStartRef.current.loopStart + delta, loopRegion.end - 0.5),
        );
        setLoopRegion({ start: newStart, end: loopRegion.end });
      } else if (loopDragType === 'end') {
        // Drag loop end
        const newEnd = Math.max(
          loopRegion.start + 0.5,
          Math.min(loopDragStartRef.current.loopEnd + delta, state.masterDuration),
        );
        setLoopRegion({ start: loopRegion.start, end: newEnd });
      } else if (loopDragType === 'body') {
        // Drag entire loop brace
        const loopDuration = loopDragStartRef.current.loopEnd - loopDragStartRef.current.loopStart;
        let newStart = loopDragStartRef.current.loopStart + delta;
        let newEnd = loopDragStartRef.current.loopEnd + delta;

        // Clamp to bounds
        if (newStart < 0) {
          newStart = 0;
          newEnd = loopDuration;
        }
        if (newEnd > state.masterDuration) {
          newEnd = state.masterDuration;
          newStart = state.masterDuration - loopDuration;
        }

        setLoopRegion({ start: newStart, end: newEnd });
      }
    };

    const handleLoopMouseUp = () => {
      setLoopDragType(null);
    };

    window.addEventListener('mousemove', handleLoopMouseMove);
    window.addEventListener('mouseup', handleLoopMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleLoopMouseMove);
      window.removeEventListener('mouseup', handleLoopMouseUp);
    };
  }, [loopDragType, loopRegion, state.masterDuration, setLoopRegion, getTimeFromMouseEvent]);

  const handleZoomIn = () => {
    setZoomLevel(Math.min((zoomLevel || 1) + 0.5, 4)); // Max 400%
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max((zoomLevel || 1) - 0.5, 0.5)); // Min 50%
  };

  // ==========================================
  // ZOOM DRAG HANDLERS (Ableton-style)
  // Click + Drag Down = Zoom In
  // Click + Drag Up = Zoom Out
  // ==========================================

  const handleZoomDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.allLoaded) return;

    // Prevent text selection during drag
    e.preventDefault();

    // Reset drag tracking
    wasZoomDragRef.current = false;

    // Start zoom drag
    setIsZoomDragging(true);
    zoomDragStartRef.current = {
      y: e.clientY,
      initialZoom: zoomLevel || 1,
    };

    // Change cursor and prevent selection
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  // Global mouse move for zoom drag
  useEffect(() => {
    if (!isZoomDragging) return;

    const handleZoomDragMove = (e: MouseEvent) => {
      const deltaY = zoomDragStartRef.current.y - e.clientY; // Positive = dragged down
      const sensitivity = 0.01; // Zoom speed

      // Mark as actual drag if moved more than 5 pixels
      if (Math.abs(deltaY) > 5) {
        wasZoomDragRef.current = true;
      }

      // Calculate new zoom: drag down (positive delta) = zoom in
      const newZoom = zoomDragStartRef.current.initialZoom + deltaY * sensitivity;
      const clampedZoom = Math.max(0.5, Math.min(4, newZoom));

      setZoomLevel(clampedZoom);
    };

    const handleZoomDragEnd = () => {
      setIsZoomDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleZoomDragMove);
    window.addEventListener('mouseup', handleZoomDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleZoomDragMove);
      window.removeEventListener('mouseup', handleZoomDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isZoomDragging, setZoomLevel]);

  // Calculate interval based on zoom level (more zoom = more markers)
  const getTimeInterval = () => {
    const zoom = zoomLevel || 1;
    if (zoom >= 3) return 1; // Every 1 second
    if (zoom >= 2) return 2; // Every 2 seconds
    if (zoom >= 1) return 5; // Every 5 seconds
    return 10; // Every 10 seconds
  };

  const timeInterval = getTimeInterval();

  return (
    <div className="flex items-stretch">
      {/* Left Panel - Time Display, Zoom & Loop Controls (matches track controls width: w-56 = 224px) */}
      <div className="w-56 bg-surface border-r border-outline p-2 flex flex-col justify-center gap-1">
        {/* Time Display - BIGGER like Ableton */}
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-brand font-semibold text-base">
            {formatTime(state.currentTime)}
          </span>
          <span className="text-dim text-xs">/</span>
          <span className="text-muted text-xs">{formatTime(state.masterDuration)}</span>
        </div>

        {/* Zoom & Loop Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono">
            {Math.round((zoomLevel || 1) * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            disabled={(zoomLevel || 1) <= 0.5}
            className="w-6 h-6 flex items-center justify-center rounded bg-elevated hover:bg-muted-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut size={12} className="text-secondary" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={(zoomLevel || 1) >= 4}
            className="w-6 h-6 flex items-center justify-center rounded bg-elevated hover:bg-muted-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn size={12} className="text-secondary" />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-outline" />

          {/* Loop Switch (Ableton-style) */}
          <button
            onClick={toggleLoopEnabled}
            disabled={!state.allLoaded}
            className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
              loopEnabled
                ? 'bg-amber-500 text-black shadow-lg'
                : 'bg-elevated text-muted hover:bg-muted-bg hover:text-foreground'
            } ${!state.allLoaded ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            title={`Loop ${loopEnabled ? 'ON' : 'OFF'} (L)`}
          >
            <Repeat size={12} />
          </button>
        </div>
      </div>

      {/* Right Panel - Timeline Ruler (aligns with waveforms) */}
      <div className="flex-1 relative overflow-x-hidden">
        <div
          ref={timelineRef}
          className={`relative h-12 bg-background ${
            state.allLoaded ? '' : 'cursor-not-allowed opacity-50'
          }`}
          style={{ width: `${(zoomLevel || 1) * 100}%`, minWidth: '100%' }}
        >
          {/* ==========================================
              LOOP ZONE (Top 12px) - For loop creation/clearing
              ========================================== */}
          <div
            className={`absolute top-0 left-0 right-0 h-3 z-10 ${
              state.allLoaded ? 'cursor-crosshair' : ''
            } ${isLoopZoneDragging ? 'bg-amber-500/10' : 'hover:bg-elevated/50'}`}
            onMouseDown={handleLoopZoneMouseDown}
            title="Drag to create loop, Click to clear"
          >
            {/* Loop Creation Preview (while dragging) */}
            {isLoopZoneDragging && loopZoneDragStart !== null && loopZoneDragEnd !== null && (
              <div
                className="absolute top-0 h-full bg-amber-500/40 border-x-2 border-amber-500 pointer-events-none"
                style={{
                  left: `${(Math.min(loopZoneDragStart, loopZoneDragEnd) / state.masterDuration) * 100}%`,
                  width: `${(Math.abs(loopZoneDragEnd - loopZoneDragStart) / state.masterDuration) * 100}%`,
                }}
              />
            )}

            {/* Loop Brace (Ableton-style) - Shows loop region on timeline */}
            {state.allLoaded && loopRegion.end > loopRegion.start && (
              <div
                className={`absolute top-0 h-full transition-opacity ${
                  loopEnabled ? 'opacity-100' : 'opacity-40'
                }`}
                style={{
                  left: `${(loopRegion.start / state.masterDuration) * 100}%`,
                  width: `${((loopRegion.end - loopRegion.start) / state.masterDuration) * 100}%`,
                }}
              >
                {/* Loop Brace Body - Draggable */}
                <div
                  className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
                    loopEnabled ? 'bg-amber-500/30' : 'bg-muted-bg/30'
                  } ${loopDragType === 'body' ? 'bg-amber-500/50' : ''}`}
                  onMouseDown={(e) => handleLoopBraceMouseDown(e, 'body')}
                  title="Drag to move loop region"
                />

                {/* Loop Start Handle */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize ${
                    loopEnabled ? 'bg-amber-500' : 'bg-muted'
                  } ${loopDragType === 'start' ? 'bg-amber-400' : ''} hover:bg-amber-400 rounded-l`}
                  onMouseDown={(e) => handleLoopBraceMouseDown(e, 'start')}
                  title={`Loop Start: ${loopRegion.start.toFixed(1)}s`}
                />

                {/* Loop End Handle */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize ${
                    loopEnabled ? 'bg-amber-500' : 'bg-muted'
                  } ${loopDragType === 'end' ? 'bg-amber-400' : ''} hover:bg-amber-400 rounded-r`}
                  onMouseDown={(e) => handleLoopBraceMouseDown(e, 'end')}
                  title={`Loop End: ${loopRegion.end.toFixed(1)}s`}
                />

                {/* Loop duration label (only show when loop is enabled) */}
                {loopEnabled && loopRegion.end - loopRegion.start > 2 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-amber-300 text-[10px] font-mono pointer-events-none">
                    {(loopRegion.end - loopRegion.start).toFixed(1)}s
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==========================================
              SEEK ZONE (Bottom part) - Click to seek, Drag vertically to zoom
              Ableton-style: drag down = zoom in, drag up = zoom out
              ========================================== */}
          <div
            className={`absolute top-3 left-0 right-0 bottom-0 ${
              state.allLoaded ? 'cursor-ns-resize' : ''
            }`}
            onMouseDown={(e) => {
              handleZoomDragStart(e);
            }}
            onClick={(e) => {
              // Only seek if it wasn't a zoom drag (check if there was significant Y movement)
              if (!wasZoomDragRef.current) {
                handleSeekZoneClick(e);
              }
            }}
            title="Click to seek, Drag up/down to zoom"
          >
            {/* Time Markers */}
            {state.allLoaded && (
              <div className="absolute inset-0 flex items-end pb-1 overflow-hidden">
                {Array.from({ length: Math.floor(state.masterDuration / timeInterval) + 1 }).map(
                  (_, i, arr) => {
                    const time = i * timeInterval;
                    const position = (time / state.masterDuration) * 100;
                    const isMajor = time % (timeInterval * 4) === 0;
                    const isFirst = i === 0;
                    const isLast = i === arr.length - 1;

                    // Adjust transform: first marker aligns left, last aligns right, others center
                    const transform = isFirst
                      ? 'translateX(0)'
                      : isLast
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)';

                    return (
                      <div
                        key={i}
                        className={`absolute bottom-0 flex flex-col pointer-events-none ${
                          isFirst ? 'items-start' : isLast ? 'items-end' : 'items-center'
                        }`}
                        style={{ left: `${position}%`, transform }}
                      >
                        {/* Tick Mark */}
                        <div
                          className={`${isMajor ? 'h-5 w-px bg-muted' : 'h-2 w-px bg-outline'}`}
                        />
                        {/* Time Label */}
                        {isMajor && (
                          <span className="text-xs text-muted font-mono mt-0.5 whitespace-nowrap">
                            {formatTime(time).slice(0, 5)}
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
