// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ARRANGEMENT_COMPONENTS_DIR, readSourceFiles } from './helpers/source-scan';

const HELPER_FILE = 'studio-ime-composition.ts';
const COMPOSING_READ_PATTERN =
  /\.isComposing\b|\b(?:keyCode|which)\s*[!=]==?\s*229\b|\b229\s*[!=]==?\s*[\w.?]*\b(?:keyCode|which)\b|\{[^}]*\bisComposing\b[^}]*\}\s*=(?!=)/g;
const HELPER_CALL_PATTERN = /\b(isImeCompositionKeyDown|isNativeImeCompositionKeyDown)\s*\(/;
const INTENT_CALL_PATTERN = /\binlineEditorKeyIntent\s*\(/;

function arrangementSources() {
  return readSourceFiles(ARRANGEMENT_COMPONENTS_DIR, ['.ts', '.tsx']);
}

function filesMatching(pattern: RegExp): string[] {
  return arrangementSources()
    .filter(({ path, text }) => path !== HELPER_FILE && pattern.test(text))
    .map(({ path }) => path)
    .sort();
}

describe('IME and held-key rule has one home (SYS-3 stage 2b)', () => {
  it('IME14: no Studio component reads isComposing or keyCode 229 inline; the inline editors call inlineEditorKeyIntent and only the two search fields call the composition helper directly (a new legitimate caller updates these lists on purpose)', () => {
    const inlineReads = arrangementSources().flatMap(({ path, text }) =>
      path === HELPER_FILE
        ? []
        : Array.from(
            text.matchAll(COMPOSING_READ_PATTERN),
            (match) => `${path}:${text.slice(0, match.index).split('\n').length}`,
          ),
    );
    expect(inlineReads).toEqual([]);
    expect(filesMatching(INTENT_CALL_PATTERN)).toEqual([
      'ArrangementDetailPanel.tsx',
      'ArrangementGroupHeader.tsx',
      'ArrangementMarkerRow.tsx',
      'ArrangementTempoRow.tsx',
    ]);
    expect(filesMatching(HELPER_CALL_PATTERN)).toEqual([
      'ArrangementLibrary.tsx',
      'ArrangementShortcutSheet.tsx',
    ]);
  });

  it('IME15: the inline-read pattern matches React and native forms, both operand orders and != of 229, which, and destructuring, and ignores object keys', () => {
    const count = (text: string) => (text.match(COMPOSING_READ_PATTERN) ?? []).length;
    expect(count('if (event.nativeEvent.isComposing) {')).toBe(1);
    expect(count('if (e.isComposing || e.keyCode === 229) {')).toBe(2);
    expect(count('if (229 === event.keyCode) {')).toBe(1);
    expect(count('if (event.keyCode==229) {')).toBe(1);
    expect(count('if (event.keyCode !== 229) {')).toBe(1);
    expect(count('if (event.which === 229) {')).toBe(1);
    expect(count('const { isComposing } = event.nativeEvent;')).toBe(1);
    expect(count('const { key, isComposing: composing } = event;')).toBe(1);
    expect(count('{ key, code: key, isComposing: true }')).toBe(0);
    expect(count('if (options === { isComposing: true }) {')).toBe(0);
    expect(count('if (event.keyCode === 2290) {')).toBe(0);
  });
});
