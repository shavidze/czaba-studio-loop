import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  STUDIO_DIALOG_SCROLLBAR_CLASS,
  STUDIO_SCROLLBAR_CLASS,
} from '~/components/arrangement/studio-scrollbar';
import { Modal } from '~/components/ui';

const ARRANGEMENT_DIR = join(process.cwd(), 'app/components/arrangement');
const LEGACY_EXPORT_DIALOG = join(process.cwd(), 'app/components/studio/ExportDialog.tsx');
const STUDIO_DIALOG_PROP = 'scrollbarClassName={STUDIO_DIALOG_SCROLLBAR_CLASS}';

function openingTags(source: string, name: string): string[] {
  const tags: string[] = [];
  const opener = new RegExp(`<${name}(?=[\\s>])`, 'g');
  for (let match = opener.exec(source); match; match = opener.exec(source)) {
    let depth = 0;
    let quote: string | null = null;
    let end = match.index + name.length + 1;
    for (; end < source.length; end++) {
      const char = source[end];
      if (quote) {
        if (char === '\\') {
          end++;
        } else if (char === quote) {
          quote = null;
        }
      } else if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
      } else if (char === '>' && depth === 0) {
        break;
      }
    }
    tags.push(source.slice(match.index, end + 1));
    opener.lastIndex = end;
  }
  return tags;
}

function modalPanelTokens(): string[] {
  const panel = screen.getByRole('dialog').firstElementChild;
  if (!(panel instanceof HTMLElement)) {
    throw new Error('Modal panel not rendered');
  }
  return panel.className.split(/\s+/).filter(Boolean);
}

afterEach(cleanup);

describe('SABA-B-12 stage 3b: Studio dialogs use the Studio scrollbar, not the store teal', () => {
  it('DS1: a Modal without scrollbarClassName keeps the store styled-scrollbar', () => {
    render(
      <Modal isOpen onClose={() => {}} aria-label="Store dialog">
        <p>Body</p>
      </Modal>,
    );
    const tokens = modalPanelTokens();
    expect(tokens).toContain('styled-scrollbar');
    expect(tokens).toEqual(
      expect.arrayContaining(['overflow-auto', 'max-h-[90vh]', 'overscroll-contain']),
    );
  });

  it('DS2: a Modal with the Studio dialog skin drops styled-scrollbar and carries every skin token', () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        scrollbarClassName={STUDIO_DIALOG_SCROLLBAR_CLASS}
        aria-label="Studio dialog"
      >
        <p>Body</p>
      </Modal>,
    );
    const tokens = modalPanelTokens();
    expect(tokens).not.toContain('styled-scrollbar');
    expect(tokens).toEqual(expect.arrayContaining(STUDIO_DIALOG_SCROLLBAR_CLASS.split(' ')));
    expect(tokens).toEqual(
      expect.arrayContaining(['overflow-auto', 'max-h-[90vh]', 'overscroll-contain']),
    );
  });

  it('DS3: the dialog skin is the lane skin without the stable gutter, and the lane skin is unchanged', () => {
    expect(STUDIO_SCROLLBAR_CLASS).toBe(
      '[scrollbar-gutter:stable] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:bg-surface [&::-webkit-scrollbar-track]:bg-surface [&::-webkit-scrollbar-corner]:bg-surface [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-surface [&::-webkit-scrollbar-thumb]:bg-dim [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb:hover]:bg-foreground [&::-webkit-scrollbar-thumb:active]:bg-foreground',
    );
    expect(STUDIO_SCROLLBAR_CLASS).toBe(
      `[scrollbar-gutter:stable] ${STUDIO_DIALOG_SCROLLBAR_CLASS}`,
    );
    expect(STUDIO_DIALOG_SCROLLBAR_CLASS).not.toMatch(/scrollbar-(gutter|color|width)/);
  });

  it('DS4: every Modal in the Studio components passes the Studio dialog skin; the legacy dialog keeps the store default', () => {
    const studioModals = readdirSync(ARRANGEMENT_DIR)
      .filter((file) => file.endsWith('.tsx'))
      .flatMap((file) =>
        openingTags(readFileSync(join(ARRANGEMENT_DIR, file), 'utf8'), 'Modal').map((tag) => ({
          file,
          tag,
        })),
      );
    expect(studioModals.map(({ file }) => file).sort()).toEqual([
      'ArrangementExportDialog.tsx',
      'ArrangementShortcutSheet.tsx',
    ]);
    for (const { tag } of studioModals) {
      expect(tag).toContain(STUDIO_DIALOG_PROP);
    }
    const legacy = openingTags(readFileSync(LEGACY_EXPORT_DIALOG, 'utf8'), 'Modal');
    expect(legacy).toHaveLength(1);
    expect(legacy[0]).not.toContain('scrollbarClassName');
    expect(openingTags('<ModalBody a="1"><Modal x={a > b ? "}" : \'>\'} y="2">', 'Modal')).toEqual([
      '<Modal x={a > b ? "}" : \'>\'} y="2">',
    ]);
  });
});
