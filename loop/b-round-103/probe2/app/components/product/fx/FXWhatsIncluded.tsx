/**
 * FXWhatsIncluded - Technical specifications for FX packs
 * Shows file formats, compatibility, and what's in the download
 */

import { Check, Download, FileAudio, Monitor } from 'lucide-react';

interface FXWhatsIncludedProps {
  formats: string[];
  quality: string;
  fileSize: string;
  compatibility?: string[];
  categories?: string[];
}

export function FXWhatsIncluded({
  formats,
  quality,
  fileSize,
  compatibility = ['Premiere Pro', 'Final Cut', 'DaVinci Resolve', 'Any DAW'],
  categories = [],
}: FXWhatsIncludedProps) {
  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Download size={20} className="text-brand" />
        What's Included
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* File Specifications */}
        <div className="bg-surface/50 border border-outline rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <FileAudio size={18} className="text-brand" />
            File Specifications
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Format</span>
              <span className="text-foreground font-medium">{formats.join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Quality</span>
              <span className="text-foreground font-medium">{quality}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total Size</span>
              <span className="text-foreground font-medium">{fileSize}</span>
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className="bg-surface/50 border border-outline rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Monitor size={18} className="text-brand" />
            Compatible With
          </div>

          <div className="space-y-2">
            {compatibility.map((software, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-brand" />
                <span className="text-secondary">{software}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories if available */}
      {categories.length > 0 && (
        <div className="bg-surface/50 border border-outline rounded-xl p-5 space-y-4">
          <div className="text-foreground font-medium">Sound Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1.5 text-sm bg-elevated text-secondary rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
