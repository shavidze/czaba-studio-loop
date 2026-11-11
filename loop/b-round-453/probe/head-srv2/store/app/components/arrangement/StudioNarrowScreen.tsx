import { Link } from '@remix-run/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '~/lib/utils';
import { preventRepeatedEnterKeyDown } from './studio-repeat-safe';

const STUDIO_NARROW_PREVIEW_URL = '/middle-east.mp3';
const STUDIO_NARROW_PREVIEW_TITLE = 'Middle East — public preview';
const STUDIO_NARROW_SHARE_TITLE = 'CZABA Studio';
const STUDIO_NARROW_LINK_COPIED = 'Link copied';
const STUDIO_NARROW_COPY_FAILED = "Couldn't copy the link.";

interface StudioNarrowScreenProps {
  className?: string;
  themeMarker: boolean;
  focusHeadingOnMount: boolean;
}

function isShareAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

export function StudioNarrowScreen({
  className,
  themeMarker,
  focusHeadingOnMount,
}: StudioNarrowScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linkFieldRef = useRef<HTMLInputElement>(null);
  const previewTitleId = useId();
  const linkFieldId = useId();
  const [shareStatus, setShareStatus] = useState('');
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);
  const [copyFailureCount, setCopyFailureCount] = useState(0);
  const [isPreviewUnavailable, setIsPreviewUnavailable] = useState(false);

  useEffect(() => {
    if (focusHeadingOnMount) {
      headingRef.current?.focus();
    }
  }, [focusHeadingOnMount]);

  useEffect(() => {
    if (copyFailureCount > 0) {
      linkFieldRef.current?.focus();
      linkFieldRef.current?.select();
    }
  }, [copyFailureCount]);

  const copyStudioLink = async (url: string) => {
    try {
      if (!navigator.clipboard) {
        throw new Error('clipboard unavailable');
      }
      await navigator.clipboard.writeText(url);
      setFallbackLink(null);
      setShareStatus(STUDIO_NARROW_LINK_COPIED);
    } catch {
      setShareStatus(STUDIO_NARROW_COPY_FAILED);
      setFallbackLink(url);
      setCopyFailureCount((count) => count + 1);
    }
  };

  const sendStudioLink = async () => {
    const url = window.location.href;
    setShareStatus('');
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: STUDIO_NARROW_SHARE_TITLE, url });
        setFallbackLink(null);
        return;
      } catch (error) {
        if (isShareAbortError(error)) {
          return;
        }
      }
    }
    await copyStudioLink(url);
  };

  return (
    <main
      className={cn(
        'flex min-h-screen flex-col bg-background px-4 py-4 text-foreground',
        className,
      )}
      data-studio-theme={themeMarker ? 'obsidian' : undefined}
      data-testid="studio-narrow-screen"
    >
      <Link
        to="/"
        className="group inline-flex items-center gap-1 self-start rounded-sm px-1 text-sm font-medium text-foreground"
        data-testid="studio-narrow-exit"
      >
        <ArrowLeft
          className="size-3 shrink-0 text-muted group-hover:text-foreground"
          strokeWidth={2}
          aria-hidden="true"
        />
        CZABA
      </Link>
      <div className="mt-10 flex w-full max-w-md flex-col">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-medium"
          data-testid="studio-narrow-heading"
        >
          The Studio works on a computer
        </h1>
        <p className="mt-2 text-sm text-muted">Listen here, or send yourself the link.</p>
        {isPreviewUnavailable ? (
          <p className="mt-6 text-sm text-muted">Preview unavailable.</p>
        ) : (
          <>
            <p id={previewTitleId} className="mt-6 text-sm">
              {STUDIO_NARROW_PREVIEW_TITLE}
            </p>
            <audio
              controls
              preload="metadata"
              src={STUDIO_NARROW_PREVIEW_URL}
              aria-labelledby={previewTitleId}
              className="mt-2 w-full scheme-dark"
              onError={() => setIsPreviewUnavailable(true)}
            />
          </>
        )}
        <button
          type="button"
          onClick={sendStudioLink}
          onKeyDown={preventRepeatedEnterKeyDown}
          className="mt-6 self-start rounded-sm border border-outline px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
        >
          Send link
        </button>
        <output aria-live="polite" className="mt-2 block min-h-5 text-sm text-muted">
          {shareStatus}
        </output>
        {fallbackLink !== null ? (
          <>
            <label htmlFor={linkFieldId} className="mt-2 text-sm text-muted">
              Studio link
            </label>
            <input
              id={linkFieldId}
              ref={linkFieldRef}
              type="text"
              readOnly
              value={fallbackLink}
              className="mt-1 w-full rounded-sm border border-outline bg-surface px-2 py-1 text-sm text-foreground"
            />
          </>
        ) : null}
      </div>
    </main>
  );
}
