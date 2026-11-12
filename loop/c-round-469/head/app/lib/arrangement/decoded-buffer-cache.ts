export const UNPINNED_DECODED_BUDGET_BYTES = 32 * 1024 * 1024;

export type DecodedBufferPinOwner = 'clips' | 'preview' | 'export';

export interface DecodedBufferShape {
  length: number;
  numberOfChannels: number;
}

export interface DecodedBufferCache<B> {
  get: (id: string) => B | undefined;
  has: (id: string) => boolean;
  set: (id: string, buffer: B, options: { evictable: boolean }) => void;
  delete: (id: string) => boolean;
  deleteMany: (ids: Iterable<string>) => void;
  clear: () => void;
  setPinned: (owner: DecodedBufferPinOwner, ids: Iterable<string>) => void;
  isPinned: (id: string) => boolean;
  totalBytes: () => number;
  evictableUnpinnedBytes: () => number;
  evict: () => string[];
  asReadonlyMap: () => ReadonlyMap<string, B>;
}

export function estimateBufferBytes({ length, numberOfChannels }: DecodedBufferShape): number {
  return length * numberOfChannels * 4;
}

export function createDecodedBufferCache<B>({
  budgetBytes,
  estimate,
}: {
  budgetBytes: number;
  estimate: (buffer: B) => number;
}): DecodedBufferCache<B> {
  const buffers = new Map<string, B>();
  const entries = new Map<string, { bytes: number; evictable: boolean; used: number }>();
  const pins = new Map<DecodedBufferPinOwner, ReadonlySet<string>>();
  let clock = 0;

  const isPinned = (id: string): boolean => {
    for (const ids of pins.values()) {
      if (ids.has(id)) {
        return true;
      }
    }
    return false;
  };

  const touch = (id: string) => {
    const entry = entries.get(id);
    if (entry) {
      clock += 1;
      entry.used = clock;
    }
  };

  const evictableUnpinnedBytes = (): number => {
    let total = 0;
    for (const [id, entry] of entries) {
      if (entry.evictable && !isPinned(id)) {
        total += entry.bytes;
      }
    }
    return total;
  };

  return {
    get: (id) => {
      const buffer = buffers.get(id);
      if (buffer !== undefined) {
        touch(id);
      }
      return buffer;
    },
    has: (id) => buffers.has(id),
    set: (id, buffer, { evictable }) => {
      buffers.set(id, buffer);
      clock += 1;
      entries.set(id, { bytes: estimate(buffer), evictable, used: clock });
    },
    delete: (id) => {
      entries.delete(id);
      return buffers.delete(id);
    },
    deleteMany: (ids) => {
      for (const id of ids) {
        entries.delete(id);
        buffers.delete(id);
      }
    },
    clear: () => {
      buffers.clear();
      entries.clear();
    },
    setPinned: (owner, ids) => {
      const next = new Set(ids);
      if (next.size === 0) {
        pins.delete(owner);
      } else {
        pins.set(owner, next);
      }
    },
    isPinned,
    totalBytes: () => {
      let total = 0;
      for (const entry of entries.values()) {
        total += entry.bytes;
      }
      return total;
    },
    evictableUnpinnedBytes,
    evict: () => {
      const removed: string[] = [];
      let over = evictableUnpinnedBytes();
      if (over <= budgetBytes) {
        return removed;
      }
      const candidates = [...entries]
        .filter(([id, entry]) => entry.evictable && !isPinned(id))
        .sort((a, b) => a[1].used - b[1].used);
      for (const [id, entry] of candidates) {
        if (over <= budgetBytes) {
          break;
        }
        buffers.delete(id);
        entries.delete(id);
        over -= entry.bytes;
        removed.push(id);
      }
      return removed;
    },
    asReadonlyMap: () => buffers,
  };
}
