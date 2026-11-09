# B round 417 -> 418: source half of the SYS-R416-PREVIEW-CONTROLLER sketch. Usage: python3 -I make-sketch-src.py <scratch-root>
import sys
root = sys.argv[1]
def sub(path, old, new, count=1):
    p = root + '/' + path
    s = open(p, encoding='utf-8').read()
    n = s.count(old)
    if n != count:
        sys.exit(f'{path}: expected {count} of {old!r}, found {n}')
    s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)
C = 'app/contexts/ArrangementContext.tsx'
sub(C, '  const previewRequestRef = useRef<string | null>(null);\n', '  const previewTokenRef = useRef(0);\n')
sub(C, '''    previewPlayerRef.current?.stopLibraryPreview();
    previewRequestRef.current = null;
    if (libraryPreviewSourceRef.current !== null) {''', '''    previewPlayerRef.current?.stopLibraryPreview();
    previewTokenRef.current += 1;
    if (libraryPreviewSourceRef.current !== null) {''')
sub(C, '''        previewRequestRef.current = null;
        releasePreviewPin();
        libraryPreviewSourceRef.current = sourceId;
        setLibraryPreviewSourceId(sourceId);
        previewPlayerRef.current.playLibraryPreviewStream(streamUrl, offset, (atSeconds) => {
          const current = streamFallbackRef.current;
          if (current?.collection === collection) {
            current.sourceIds.add(sourceId);
          } else {
            streamFallbackRef.current = { collection, sourceIds: new Set([sourceId]) };
          }
          libraryPreviewSourceRef.current = null;
          setLibraryPreviewSourceId(null);
          startLibraryPreviewRef.current(sourceId, atSeconds);
        });''', '''        previewTokenRef.current += 1;
        const token = previewTokenRef.current;
        releasePreviewPin();
        libraryPreviewSourceRef.current = sourceId;
        setLibraryPreviewSourceId(sourceId);
        previewPlayerRef.current.playLibraryPreviewStream(streamUrl, offset, (atSeconds) => {
          const current = streamFallbackRef.current;
          if (current?.collection === collection) {
            current.sourceIds.add(sourceId);
          } else {
            streamFallbackRef.current = { collection, sourceIds: new Set([sourceId]) };
          }
          queueMicrotask(() => {
            if (previewTokenRef.current !== token) {
              return;
            }
            libraryPreviewSourceRef.current = null;
            setLibraryPreviewSourceId(null);
            startLibraryPreviewRef.current(sourceId, atSeconds);
          });
        });''')
sub(C, '''        stopLibraryPreview();
        const owner = collectionControllerRef.current;
        const controller = owner?.collection === collection ? owner.controller : null;
        if (!controller) {
          setStatus(studioLibraryStrings.sourceNotLoaded(source.title));
          return;
        }
        if (!ensureAudioContext()) {
          return;
        }
        previewRequestRef.current = sourceId;''', '''        const owner = collectionControllerRef.current;
        const controller = owner?.collection === collection ? owner.controller : null;
        if (!controller) {
          setStatus(studioLibraryStrings.sourceNotLoaded(source.title));
          return;
        }
        stopLibraryPreview();
        if (!ensureAudioContext()) {
          return;
        }
        const token = previewTokenRef.current;''')
sub(C, '''          if (previewRequestRef.current !== sourceId) {
            return;
          }
          previewRequestRef.current = null;
          if (decodedBuffers.has(sourceId)) {''', '''          if (previewTokenRef.current !== token) {
            return;
          }
          if (decodedBuffers.has(sourceId)) {''')
sub(C, '''      previewRequestRef.current = null;
      decodedBuffers.setPinned('preview', [sourceId]);
      decodedBuffers.evict();''', '''      previewTokenRef.current += 1;
      decodedBuffers.setPinned('preview', [sourceId]);
      decodedBuffers.evict();''')
P = 'app/lib/arrangement/preview.client.ts'
sub(P, '''      const start = Math.max(0, offset);
      if (active?.kind === 'stream' && active.url === url) {
        try {
          active.element.currentTime = start;
          active.restartArmedStall();
        } catch {
          active.fail();
        }
        return;
      }''', '''      const start = Math.max(0, offset);
      const playing = active;
      if (playing?.kind === 'stream' && playing.url === url) {
        try {
          playing.element.currentTime = start;
          playing.restartArmedStall();
        } catch {
          playing.fail();
        }
        return;
      }''')
sub(P, '''      const handleError = () => {
        if (active === preview) {
          const at = element.currentTime;
          stopActive();
          onStreamError(at);
        }
      };''', '''      const readTime = () => {
        try {
          return element.currentTime;
        } catch {
          return start;
        }
      };
      const reportError = (at: number) => {
        if (active === preview) {
          stopActive();
          errorHandler(at);
        }
      };
      const handleError = () => {
        if (active === preview) {
          reportError(readTime());
        }
      };''')
sub(P, '''        const armedAt = element.currentTime;
        cancelStall = scheduleStallTimeout(() => {
          cancelStall = null;
          if (active === preview && element.currentTime === armedAt) {
            handleError();
          }
        }, streamStallTimeoutMs);''', '''        const armedAt = readTime();
        cancelStall = scheduleStallTimeout(() => {
          cancelStall = null;
          if (active !== preview) {
            return;
          }
          const now = readTime();
          if (now === armedAt) {
            reportError(now);
          }
        }, streamStallTimeoutMs);''')
sub(P, '''  fail: () => void;
  restartArmedStall: () => void;
}''', '''  fail: () => void;
  restartArmedStall: () => void;
  setErrorHandler: (handler: (atSeconds: number) => void) => void;
}''')
sub(P, '''      if (playing?.kind === 'stream' && playing.url === url) {
        try {''', '''      if (playing?.kind === 'stream' && playing.url === url) {
        playing.setErrorHandler(onStreamError);
        try {''')
sub(P, '''      const element = createAudioElement();
      element.crossOrigin = 'anonymous';''', '''      const element = createAudioElement();
      element.crossOrigin = 'anonymous';
      let errorHandler = onStreamError;''')
sub(P, '''        fail: handleError,
        restartArmedStall,
      };''', '''        fail: handleError,
        restartArmedStall,
        setErrorHandler: (handler) => {
          errorHandler = handler;
        },
      };''')
print('src sketch applied')
