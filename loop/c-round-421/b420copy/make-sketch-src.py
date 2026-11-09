# B round 420 -> 421: source half of the SYS-R418-PREVIEW-LIFECYCLE sketch.
# Usage: python3 -I make-sketch-src.py <scratch-root>
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
P = 'app/lib/arrangement/preview.client.ts'

# Ruling 1: the collection effect teardown (collection change and provider unmount) stops the preview
# through stopLibraryPreview, which bumps the token.
sub(C, '''    const resetDecodedBuffers = () => {
      controller.abort();
      if (collectionControllerRef.current?.controller === controller) {
        collectionControllerRef.current = null;
      }
''', '''    const resetDecodedBuffers = () => {
      controller.abort();
      if (collectionControllerRef.current?.controller === controller) {
        collectionControllerRef.current = null;
      }
      stopLibraryPreview();
''')
sub(C, '''    resyncAfterDecode,
    storeSourcePeaks,
    setStatus,
  ]);
''', '''    resyncAfterDecode,
    stopLibraryPreview,
    storeSourcePeaks,
    setStatus,
  ]);
''')

# Rulings 2-4: readTime on the active stream, an updatable start, the tick fallback is armedAt.
sub(P, '''  restartArmedStall: () => void;
  setErrorHandler: (handler: (atSeconds: number) => void) => void;
}''', '''  restartArmedStall: () => void;
  setErrorHandler: (handler: (atSeconds: number) => void) => void;
  setStart: (atSeconds: number) => void;
  readTime: () => number;
}''')
sub(P, '''    playLibraryPreviewStream(url, offset, onStreamError) {
      const start = Math.max(0, offset);
      const playing = active;
      if (playing?.kind === 'stream' && playing.url === url) {
        playing.setErrorHandler(onStreamError);
        try {''', '''    playLibraryPreviewStream(url, offset, onStreamError) {
      let start = Math.max(0, offset);
      const playing = active;
      if (playing?.kind === 'stream' && playing.url === url) {
        playing.setErrorHandler(onStreamError);
        playing.setStart(start);
        try {''')
sub(P, '''      const readTime = () => {
        try {
          return element.currentTime;
        } catch {
          return start;
        }
      };''', '''      const readTime = (fallback = start) => {
        try {
          return element.currentTime;
        } catch {
          return fallback;
        }
      };''')
sub(P, '''          const now = readTime();
          if (now === armedAt) {''', '''          const now = readTime(armedAt);
          if (now === armedAt) {''')
sub(P, '''        setErrorHandler: (handler) => {
          errorHandler = handler;
        },
      };''', '''        setErrorHandler: (handler) => {
          errorHandler = handler;
        },
        setStart: (atSeconds) => {
          start = atSeconds;
        },
        readTime: () => readTime(),
      };''')
sub(P, '''      if (active.kind === 'stream') {
        return active.element.currentTime;
      }''', '''      if (active.kind === 'stream') {
        return active.readTime();
      }''')
print('src sketch applied')
