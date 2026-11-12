import { Download, FileArchive, Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui';
import { debug } from '~/lib/debug';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productHandle: string;
  userLicense: 'premium' | 'standard' | 'universal' | null;
  customerAccessToken?: string;
}

/**
 * DownloadDialog - უსაფრთხო download dialog Signed URLs-ით
 *
 * ნაცვლად პირდაპირ URL-ების, ახლა:
 * 1. მომხმარებელი აჭერს download ღილაკს
 * 2. API-ს ვუძახებთ Signed URL-ის მისაღებად
 * 3. API ამოწმებს ownership-ს და აბრუნებს დროებით URL-ს
 * 4. ვხსნით გადმოწერას
 */
export function DownloadDialog({
  isOpen,
  onClose,
  productTitle,
  productHandle,
  userLicense,
  customerAccessToken,
}: DownloadDialogProps) {
  const [isDownloading, setIsDownloading] = useState<
    'premium' | 'standard' | 'universal' | 'license' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * handleDownload - Signed URL-ის მოთხოვნა და გადმოწერა
   */
  const handleDownload = async (
    type: 'premium' | 'standard' | 'universal' | 'license',
    filename: string,
  ) => {
    if (!customerAccessToken) {
      setError('Authentication required');
      return;
    }

    setIsDownloading(type);
    setError(null);

    try {
      // API-ს ვუძახებთ Signed URL-ისთვის
      const response = await fetch(
        `/api/download?product=${encodeURIComponent(productHandle)}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${customerAccessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Download failed');
      }

      if (!data.downloadUrl) {
        throw new Error('No download URL received');
      }

      debug.log(`📥 Downloading: ${filename}`);

      // გადმოწერის დაწყება Signed URL-ით
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // დიალოგის დახურვა
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-modal-lg border border-outline">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline">
          <h2 className="text-foreground text-xl font-semibold flex items-center gap-2">
            <Download size={24} className="text-brand" />
            Download Files
          </h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Product Info */}
          <div className="bg-background rounded-lg p-4 border border-outline">
            <p className="text-muted text-sm mb-1">Product</p>
            <h3 className="text-foreground text-lg font-semibold">{productTitle}</h3>
            {userLicense && (
              <p className="text-brand text-sm mt-2 flex items-center gap-2">
                <Sparkles size={14} />
                <span className="capitalize">{userLicense} License</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Download Options */}
          <div className="space-y-3">
            <p className="text-secondary text-sm font-medium">
              {userLicense === 'universal'
                ? 'Download your collection:'
                : 'Choose version to download:'}
            </p>

            {/* Premium Download */}
            {(userLicense === 'premium' || userLicense === 'universal') && (
              <button
                onClick={() =>
                  handleDownload(
                    userLicense === 'universal' ? 'universal' : 'premium',
                    `${productTitle}.zip`,
                  )
                }
                disabled={isDownloading !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-brand/20 to-brand/10 border-2 border-brand/50 hover:border-brand transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-brand/20 flex items-center justify-center">
                    {isDownloading === 'premium' || isDownloading === 'universal' ? (
                      <Loader2 size={24} className="text-brand animate-spin" />
                    ) : (
                      <Sparkles size={24} className="text-brand" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-semibold">
                      {userLicense === 'universal' ? 'Universal Collection' : 'Premium Licensed'}
                    </p>
                    <p className="text-muted text-sm">
                      {userLicense === 'universal'
                        ? 'Original recordings • WAV'
                        : 'Full Mix • MP3 + WAV • High Quality'}
                    </p>
                  </div>
                </div>
                <Download
                  size={20}
                  className="text-brand group-hover:scale-110 transition-transform"
                />
              </button>
            )}

            {userLicense !== 'universal' && (
              <button
                onClick={() =>
                  handleDownload('standard', `${productTitle} - Standard Licensed.zip`)
                }
                disabled={isDownloading !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-elevated border-2 border-outline hover:border-outline-hover transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted-bg flex items-center justify-center">
                    {isDownloading === 'standard' ? (
                      <Loader2 size={24} className="text-secondary animate-spin" />
                    ) : (
                      <FileArchive size={24} className="text-secondary" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-semibold">Standard Licensed</p>
                    <p className="text-muted text-sm">All Stems Separate • WAV • High Quality</p>
                  </div>
                </div>
                <Download
                  size={20}
                  className="text-muted group-hover:scale-110 transition-transform"
                />
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-background rounded-lg p-4 border border-outline">
            <p className="text-muted text-xs leading-relaxed">
              Use your downloaded files in personal and commercial projects according to your
              license terms.
              {userLicense === 'premium' && ' Premium includes the full mixed track.'}
              {userLicense === 'standard' &&
                ' Standard includes all individual stems for custom mixing.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
