import { ArrowUp, Check, Sparkles } from 'lucide-react';
import type { DisplayVersion } from '~/lib/product-utils';

interface VersionSelectorProps {
  versions: DisplayVersion[];
  selectedVersion: DisplayVersion;
  onSelectVersion: (version: DisplayVersion) => void;
  ownedVersionType?: 'premium' | 'standard' | 'universal' | null;
  ownedVersionPrice?: number;
}

export function VersionSelector({
  versions,
  selectedVersion,
  onSelectVersion,
  ownedVersionType,
  ownedVersionPrice = 0,
}: VersionSelectorProps) {
  const isVersionOwned = (versionName: string): boolean => {
    const name = versionName.toLowerCase();
    if (ownedVersionType === 'premium') return true;
    if (ownedVersionType === 'standard' && name === 'standard') return true;
    return false;
  };

  const canUpgradeTo = (versionName: string): boolean => {
    const name = versionName.toLowerCase();
    return ownedVersionType === 'standard' && name === 'premium';
  };

  const getUpgradePrice = (version: DisplayVersion): number | undefined => {
    if (version.price === undefined) return undefined;
    return version.price - ownedVersionPrice;
  };

  const visibleVersions = versions.filter((version) => {
    const name = version.name.toLowerCase();
    if (ownedVersionType === 'standard' && name === 'standard') return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-sm text-muted uppercase tracking-[0.15em]">
        {ownedVersionType === 'standard' ? 'Upgrade Version' : 'Select Version'}
      </h2>

      <div
        className={`grid grid-cols-1 ${visibleVersions.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}
      >
        {visibleVersions.map((version) => {
          const isSelected = selectedVersion.id === version.id;
          const isFeatured = version.isFeatured;
          const isOwned = isVersionOwned(version.name);
          const isUpgrade = canUpgradeTo(version.name);
          const upgradePrice = isUpgrade ? getUpgradePrice(version) : undefined;

          return (
            <button
              key={version.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => !isOwned && onSelectVersion(version)}
              disabled={isOwned}
              className={`
                relative p-5 rounded-xl text-left transition-all duration-200 group border-2
                ${
                  isOwned
                    ? 'bg-brand/5 border-brand/20 cursor-not-allowed'
                    : isSelected
                      ? 'bg-surface border-brand/40 cursor-pointer'
                      : 'bg-surface/50 border-outline hover:border-outline-hover cursor-pointer'
                }
              `}
            >
              {isOwned && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand/10 border border-brand/20 rounded text-brand text-xs uppercase tracking-wider font-medium mb-3">
                  <Check size={12} />
                  <span>Owned</span>
                </div>
              )}

              {isUpgrade && !isOwned && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand/10 border border-brand/20 rounded text-brand text-xs uppercase tracking-wider font-medium mb-3">
                  <ArrowUp size={12} />
                  <span>Upgrade</span>
                </div>
              )}

              {isFeatured && !isOwned && !isUpgrade && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-accent/10 border border-accent/20 rounded text-accent text-xs uppercase tracking-wider font-medium mb-3">
                  <Sparkles size={12} />
                  <span>Premium</span>
                </div>
              )}

              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <span
                  className={`text-lg font-medium ${isSelected ? 'text-foreground' : 'text-muted group-hover:text-foreground'} transition-colors`}
                >
                  {version.displayName}
                </span>
                <div className="flex shrink-0 items-center gap-3">
                  {version.price === undefined ? (
                    <span className="text-sm font-light text-muted">Price unavailable</span>
                  ) : isUpgrade && upgradePrice !== undefined ? (
                    <div className="text-right">
                      <span className="text-xl font-light text-brand">+${upgradePrice}</span>
                      <span className="block text-xs text-muted line-through">
                        ${version.price}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-xl font-light ${isSelected ? 'text-foreground' : 'text-muted'}`}
                    >
                      ${version.price}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected || isOwned ? 'border-brand bg-brand' : 'border-muted'
                    }`}
                  >
                    {(isSelected || isOwned) && <Check size={12} className="text-background" />}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted mb-4">
                {isUpgrade
                  ? 'Standard credit applied'
                  : version.audioFileCount
                    ? `${version.audioFileCount} audio files`
                    : 'See collection details below'}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {version.formats.map((format) => (
                  <span key={format} className="px-2 py-0.5 text-xs bg-elevated text-muted rounded">
                    {format}
                  </span>
                ))}
              </div>

              {(version.quality || version.fileSize) && (
                <div className="flex flex-wrap gap-4 text-xs text-muted pt-3 border-t border-outline/50">
                  <span>{version.quality}</span>
                  <span>{version.fileSize}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
