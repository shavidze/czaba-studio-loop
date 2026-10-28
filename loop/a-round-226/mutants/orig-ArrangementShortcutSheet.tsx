import { X } from 'lucide-react';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import { Modal } from '~/components/ui';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { filterStudioShortcutGroups } from '~/lib/arrangement/shortcuts';
import { studioShortcutSheetStrings } from '~/lib/arrangement/strings';

interface ArrangementShortcutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  fallbackFocusRef: RefObject<HTMLElement | null>;
}

const SHORTCUT_SHEET_FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function shortcutSheetFocusables(content: HTMLElement): HTMLElement[] {
  return Array.from(content.querySelectorAll<HTMLElement>(SHORTCUT_SHEET_FOCUSABLE));
}

export function ArrangementShortcutSheet({
  isOpen,
  onClose,
  fallbackFocusRef,
}: ArrangementShortcutSheetProps) {
  const titleId = useId();
  const [query, setQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      if (
        opener &&
        opener !== document.body &&
        opener.isConnected &&
        !opener.matches(':disabled')
      ) {
        opener.focus();
        if (document.activeElement === opener) {
          return;
        }
      }
      fallbackFocusRef.current?.focus();
    };
  }, [isOpen, fallbackFocusRef]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
    searchRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleSheetKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        return;
      }
      if (event.repeat && (event.key === '?' || (event.shiftKey && event.code === 'Slash'))) {
        event.preventDefault();
        return;
      }
      const content = contentRef.current;
      if (event.key !== 'Tab' || !content) {
        return;
      }
      const focusable = shortcutSheetFocusables(content);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      const active = document.activeElement;
      let target: HTMLElement | null = null;
      if (!(active instanceof HTMLElement) || !focusable.includes(active)) {
        target = event.shiftKey ? last : first;
      } else if (event.shiftKey && active === first) {
        target = last;
      } else if (!event.shiftKey && active === last) {
        target = first;
      }
      if (!target) {
        return;
      }
      event.preventDefault();
      target.focus();
    };
    window.addEventListener('keydown', handleSheetKeyDown, true);
    return () => window.removeEventListener('keydown', handleSheetKeyDown, true);
  }, [isOpen]);

  const groups = filterStudioShortcutGroups(query);
  const trimmedQuery = query.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={false}
      aria-labelledby={titleId}
    >
      <div
        ref={contentRef}
        className="flex flex-col gap-4 p-6"
        onKeyUp={(event) => {
          if (event.key === ' ') {
            event.stopPropagation();
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-medium text-foreground">
              {studioShortcutSheetStrings.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{studioShortcutSheetStrings.subline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={studioShortcutSheetStrings.close}
            title={studioShortcutSheetStrings.close}
            className="shrink-0 rounded-sm p-1 text-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={studioShortcutSheetStrings.searchLabel}
          placeholder={studioShortcutSheetStrings.searchPlaceholder}
          className="w-full rounded-sm border border-outline bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
        />
        {groups.length === 0 ? (
          <p className="text-sm text-muted" data-testid="shortcut-sheet-no-match">
            {studioShortcutSheetStrings.noMatch(trimmedQuery)}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {groups.map((group) => (
              <section key={group.id} aria-labelledby={`${titleId}-${group.id}`}>
                <h3
                  id={`${titleId}-${group.id}`}
                  className="mb-2 text-xs font-medium uppercase tracking-label text-muted"
                >
                  {group.title}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {group.rows.map((row) => (
                    <li
                      key={row.id}
                      data-shortcut-id={row.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
                    >
                      <span className="min-w-0 flex-1 basis-32 text-sm text-foreground">
                        {row.action}
                      </span>
                      <span className="ml-auto flex flex-wrap justify-end gap-1">
                        {row.keys.map((key) => (
                          <kbd
                            key={key}
                            className="whitespace-nowrap rounded-sm border border-outline px-1 font-mono text-xs text-foreground"
                          >
                            {key}
                          </kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
