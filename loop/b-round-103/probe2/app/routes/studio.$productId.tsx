import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useParams } from '@remix-run/react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Keyboard,
  Loader2,
  Lock,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RequireAuth } from '~/components/auth';
import {
  ExportDialog,
  GlobalPlayhead,
  PlaybackControls,
  ScrubZone,
  StemsLoadingAnimation,
  StudioTrackList,
  TransportBar,
  VideoPlayer,
  VideoUploadZone,
} from '~/components/studio';
import { MobileBlocker } from '~/components/ui';
import { StudioProvider, useStudio } from '~/contexts/StudioContext';
import { useAuth } from '~/hooks/useAuth';
import { usePurchases } from '~/hooks/usePurchases';
import { trackStudioOpened } from '~/lib/analytics';
import { trackFBStudioOpened } from '~/lib/facebook-pixel';
import { getStudioUrl } from '~/lib/r2.config';
import studioStyles from '~/styles/studio.css?url';
import type { ProductWithStems } from '~/types/studio';

// Route-specific CSS (proper Remix way - avoids hydration issues)
export const links: LinksFunction = () => [{ rel: 'stylesheet', href: studioStyles }];

// Keyboard shortcuts panel component
function KeyboardShortcutsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Playback',
      items: [
        { key: 'Space', action: 'Play / Pause' },
        { key: 'Enter', action: 'Stop' },
        { key: '← / →', action: 'Seek 1s' },
        { key: 'Shift + ← / →', action: 'Seek 5s' },
        { key: 'Home / End', action: 'Go to Start / End' },
        { key: 'Click on Waveform', action: 'Seek to Position' },
        { key: 'Click on Ruler', action: 'Seek to Position' },
      ],
    },
    {
      category: 'View',
      items: [
        { key: '+ / -', action: 'Zoom In / Out' },
        { key: '0', action: 'Reset Zoom (100%)' },
        { key: 'Z', action: 'Zoom to Selection' },
        { key: 'W', action: 'Fit Width (100%)' },
        { key: 'Drag ↕ on Ruler', action: 'Zoom (Ableton-style)' },
        { key: 'G', action: 'Toggle Snap Grid' },
      ],
    },
    {
      category: 'Selection',
      items: [
        { key: 'Click', action: 'Select Track' },
        { key: 'Ctrl + Click', action: 'Toggle Selection' },
        { key: 'Shift + Click', action: 'Range Select' },
        { key: 'Ctrl + A', action: 'Select All' },
        { key: 'Escape', action: 'Deselect All' },
      ],
    },
    {
      category: 'Track Actions',
      items: [
        { key: 'M', action: 'Mute Selected' },
        { key: 'S', action: 'Solo Selected' },
      ],
    },
    {
      category: 'Loop',
      items: [
        { key: 'L', action: 'Toggle Loop On/Off' },
        { key: 'Ctrl + L', action: 'Set Loop from Selection' },
        { key: 'Drag on Ruler (top)', action: 'Create Loop Region' },
        { key: 'Click on Ruler (top)', action: 'Clear Loop Region' },
      ],
    },
    {
      category: 'Edit',
      items: [
        { key: 'Ctrl + Z', action: 'Undo' },
        { key: 'Ctrl + Shift + Z', action: 'Redo' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg border border-outline shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-outline px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Keyboard size={20} className="text-brand" />
            Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-medium text-brand mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{item.action}</span>
                    <kbd className="px-2 py-1 bg-elevated rounded text-secondary font-mono text-xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-outline px-6 py-3 text-center text-dim text-xs">
          Press <kbd className="px-1 py-0.5 bg-elevated rounded">?</kbd> anytime to show this panel
        </div>
      </div>
    </div>
  );
}

/**
 * Build stems URL using Cloudflare Worker proxy
 */
function buildStemUrl(productHandle: string, file: string): string {
  return getStudioUrl(productHandle, file);
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { productId } = params;

  if (!productId) {
    throw new Response('Product ID is required', { status: 400 });
  }

  const stemsFolder = 'middle-east';
  const stemsData = [
    { file: 'Bass Drum.wav', name: 'Bass Drum', order: 1 },
    { file: 'Bass.wav', name: 'Bass', order: 2 },
    { file: 'Didgeridoo.wav', name: 'Didgeridoo', order: 3 },
    { file: 'Dombra Aux Left.wav', name: 'Dombra Aux Left', order: 4 },
    { file: 'Dombra Aux Right.wav', name: 'Dombra Aux Right', order: 5 },
    { file: 'Dombra Rithm.wav', name: 'Dombra Rithm', order: 6 },
    { file: 'Duduk.wav', name: 'Duduk', order: 7 },
    { file: 'East Zurna.wav', name: 'East Zurna', order: 8 },
    { file: 'Electric Guitar.wav', name: 'Electric Guitar', order: 9 },
    { file: 'Electric Guitar 2.wav', name: 'Electric Guitar 2', order: 10 },
  ];

  const product: ProductWithStems = {
    id: productId,
    title: 'Middle East',
    artist: 'ARAM',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    stems: stemsData.map((stem, index) => ({
      id: `stem-${index + 1}`,
      name: stem.name,
      audioUrl: buildStemUrl(stemsFolder, stem.file),
      order: stem.order,
    })),
  };

  if (!product.stems || product.stems.length === 0) {
    throw new Response('Product not found or has no stems', { status: 404 });
  }

  return json({ product });
}

function StudioContent() {
  const { product } = useLoaderData<typeof loader>();
  const {
    loadProduct,
    state,
    loadVideo,
    clearVideo,
    setVideoPanelExpanded,
    videoRef,
    setVideoStartOffset,
    selectedStemIds,
    snap,
  } = useStudio();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const hasTrackedRef = useRef(false);
  const { user, isInitializing: authLoading } = useAuth();

  useEffect(() => {
    async function loadWithToken() {
      // Wait for auth to finish loading
      if (authLoading) return;

      if (!user?.accessToken) {
        setTokenError('Authentication required');
        setIsLoadingToken(false);
        return;
      }

      setIsLoadingToken(true);

      try {
        // Fetch studio token for protected stems
        const tokenParameters = new URLSearchParams({ product: product.id });
        for (const stem of product.stems) {
          const stemUrl = new URL(stem.audioUrl, window.location.origin);
          tokenParameters.append(
            'file',
            decodeURIComponent(stemUrl.pathname.split('/').pop() || ''),
          );
        }
        const response = await fetch(`/api/studio-token?${tokenParameters}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get studio access');
        }

        const { token } = await response.json();

        // Add token to all stem URLs
        const productWithTokens = {
          ...product,
          stems: product.stems.map((stem) => ({
            ...stem,
            audioUrl: `${stem.audioUrl}?token=${encodeURIComponent(token)}`,
          })),
        };

        loadProduct(productWithTokens);
        setIsLoadingToken(false);

        // Analytics Events: studio_opened (ერთხელ თითო პროდუქტზე)
        if (!hasTrackedRef.current) {
          trackStudioOpened({
            productId: product.id,
            productTitle: product.title,
          });
          trackFBStudioOpened({
            productId: product.id,
            productTitle: product.title,
          });
          hasTrackedRef.current = true;
        }
      } catch (error) {
        console.error('Studio token error:', error);
        setTokenError(error instanceof Error ? error.message : 'Failed to access studio');
        setIsLoadingToken(false);
      }
    }

    loadWithToken();
  }, [loadProduct, product, user?.accessToken, authLoading]);

  // Listen for ? key to show shortcuts, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape' && isShortcutsOpen) {
        e.preventDefault();
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen]);

  return (
    <div className="studio-container bg-background flex flex-col">
      {/* Mobile Warning - Studio is desktop-only */}
      <MobileBlocker
        title="Studio is Desktop-Only"
        description="The Studio experience with waveform editing, multi-track mixing, and video sync requires a desktop browser. Please open this page on a computer for the best experience."
        showContinueAnyway={true}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Export Dialog */}
      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* STICKY HEADER: PlaybackControls + TransportBar */}
      <div className="sticky top-0 z-30 bg-surface border-b border-outline shadow-lg">
        {/* Transport Controls */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-outline/50">
          {/* Left - Back Button */}
          <Link
            to="/account/downloads"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-xs">Downloads</span>
          </Link>

          {/* Center - Playback Controls */}
          <div className="flex items-center gap-4">
            <PlaybackControls />
            {state.isLoading && (
              <div className="flex items-center gap-2 text-muted text-xs">
                <Loader2 size={12} className="animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </div>

          {/* Right - Status & Shortcuts */}
          <div className="flex items-center gap-3">
            {selectedStemIds.size > 0 && (
              <div className="px-2 py-0.5 bg-brand/20 rounded text-brand text-xs">
                {selectedStemIds.size} selected
              </div>
            )}
            {snap.enabled && (
              <div className="px-2 py-0.5 bg-amber-500/20 rounded text-amber-400 text-xs">Snap</div>
            )}
            <span className="text-muted text-xs truncate max-w-[120px]">{product.title}</span>
            <button
              onClick={() => setIsExportOpen(true)}
              disabled={!state.allLoaded}
              className="p-1.5 rounded hover:bg-elevated text-muted hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export Mix"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="p-1.5 rounded hover:bg-elevated text-muted hover:text-foreground transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard size={14} />
            </button>
          </div>
        </div>

        {/* Timeline Ruler */}
        <TransportBar />
      </div>

      {/* CONTENT */}
      <div>
        {/* Video Sync Section - Collapsible */}
        <div className="bg-surface border-b border-outline">
          <button
            onClick={() => setVideoPanelExpanded(!state.videoPanelExpanded)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-background/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {state.videoPanelExpanded ? (
                <ChevronDown size={14} className="text-muted" />
              ) : (
                <ChevronRight size={14} className="text-muted" />
              )}
              <span className="text-xs font-medium text-foreground">Video Sync</span>
              {state.video.isLoaded && (
                <span className="text-xs text-muted">({state.video.metadata?.resolution})</span>
              )}
            </div>
          </button>

          {state.videoPanelExpanded && (
            <div className="px-4 pb-4 flex justify-center">
              <div
                className="w-full max-w-7xl"
                style={{
                  resize: 'both',
                  minWidth: '300px',
                  minHeight: '200px',
                  maxWidth: '1792px',
                }}
              >
                {state.video.isLoaded ? (
                  <VideoPlayer
                    videoRef={videoRef}
                    blobUrl={state.video.blobUrl!}
                    metadata={state.video.metadata!}
                    onRemove={clearVideo}
                    videoDuration={state.video.duration}
                    stemsDuration={state.masterDuration}
                    startOffset={state.video.startOffset}
                    onOffsetChange={setVideoStartOffset}
                  />
                ) : (
                  <VideoUploadZone
                    onVideoSelect={loadVideo}
                    isUploading={state.video.isUploading}
                    uploadProgress={state.video.uploadProgress}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrub Zone - Drag area for playhead between video and tracks */}
        <ScrubZone />

        {/* Tracks Area with Global Playhead */}
        <div className="relative bg-background">
          <GlobalPlayhead trackControlsWidth={224} />

          {/* Main Content - Tracks */}
          {tokenError ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center max-w-4xl w-full px-4">
                <h2 className="text-2xl font-bold text-foreground mb-4">Access Error</h2>
                <p className="text-muted mb-6">{tokenError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-brand text-foreground rounded-lg hover:bg-brand/90 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isLoadingToken || authLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={48} className="text-brand animate-spin mx-auto mb-4" />
                <p className="text-foreground text-lg">Verifying access...</p>
              </div>
            </div>
          ) : state.isLoading ? (
            <StemsLoadingAnimation
              stems={state.stems.map((s) => ({
                id: s.id,
                name: s.name,
                isLoaded: s.isLoaded,
              }))}
              productTitle={product.title}
            />
          ) : !state.allLoaded ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center max-w-4xl w-full px-4">
                <h2 className="text-2xl font-bold text-foreground mb-4">Failed to Load Stems</h2>
                <p className="text-muted mb-6">
                  We couldn't load the audio stems for this track. Please try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-brand text-foreground rounded-lg hover:bg-brand/90 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <StudioTrackList />
          )}
        </div>
      </div>
    </div>
  );
}

function RequireStudioOwnership({
  children,
  productHandle,
}: {
  children: React.ReactNode;
  productHandle: string;
}) {
  const { isProductOwnedByHandle, getProductVersionType, isLoading } = usePurchases();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const isOwned = isProductOwnedByHandle(productHandle);
  const versionType = getProductVersionType(productHandle);

  // Case 1: არ აქვს ნაყიდი
  if (!isOwned || (versionType !== 'standard' && versionType !== 'premium')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Purchase Required</h1>
          <p className="text-muted mb-6">
            Purchase this music product to access stems and mixing features in Studio.
          </p>
          <Link
            to={`/products/${productHandle}`}
            className="inline-block px-6 py-3 bg-brand text-brand-foreground font-medium rounded-lg hover:bg-brand/90 transition-colors"
          >
            View Product
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function StudioPage() {
  const params = useParams();
  const productHandle = params.productId || '';

  return (
    <RequireAuth>
      <RequireStudioOwnership productHandle={productHandle}>
        <StudioProvider>
          <StudioContent />
        </StudioProvider>
      </RequireStudioOwnership>
    </RequireAuth>
  );
}
