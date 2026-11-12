import { useState } from 'react';
import { FilterBar } from '~/components/filters';
import { useFilters } from '~/hooks';
import type { Asset, AssetType } from '~/types';
import { AssetRow } from './AssetRow';

interface AssetListingPageProps {
  assets: Asset[];
  assetType: AssetType;
  primaryFilterLabel: string;
  primaryFilterOptions: string[];
  secondaryFilterLabel: string;
  secondaryFilterOptions: string[];
  instrumentOptions: string[];
  pageTitle: string;
}

export function AssetListingPage({
  assets,
  primaryFilterLabel,
  primaryFilterOptions,
  secondaryFilterLabel,
  secondaryFilterOptions,
  instrumentOptions,
  pageTitle,
}: AssetListingPageProps) {
  const { activeFilters, hasActiveFilters, clearAllFilters } = useFilters();

  const durationSeconds = (duration?: string) =>
    (duration ?? '0').split(':').reduce((total, part) => total * 60 + (Number(part) || 0), 0);

  const [sortBy, setSortBy] = useState('Staff Picks');

  // Filter assets based on active filters
  const filteredAssets = assets.filter((asset) => {
    // Primary filter (Genre for music, Category for SFX/Presets)
    if (activeFilters.primary.length > 0) {
      if (asset.type === 'music') {
        const genre = asset.genre;
        if (!activeFilters.primary.includes(genre)) {
          return false;
        }
      } else {
        const category = asset.category;
        if (!activeFilters.primary.includes(category)) {
          return false;
        }
      }
    }

    // Secondary filter (SubGenre for music, Tags for SFX, Software for Presets)
    if (activeFilters.secondary.length > 0) {
      if (asset.type === 'music') {
        const subGenres = asset.subGenres || [];
        if (!activeFilters.secondary.some((sg) => subGenres.includes(sg))) {
          return false;
        }
      } else if (asset.type === 'sfx') {
        const tags = asset.tags || [];
        if (!activeFilters.secondary.some((tag) => tags.includes(tag))) {
          return false;
        }
      } else if (asset.type === 'preset') {
        const software = asset.software;
        if (!activeFilters.secondary.includes(software)) {
          return false;
        }
      }
    }

    return true;
  });

  // TODO: დროებიტია ეს შეიცვლება
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'Duration':
        return durationSeconds(a.duration) - durationSeconds(b.duration);
      default:
        // Keep original order for Staff Picks
        return 0;
    }
  });

  return (
    <div className="music-collection-page">
      <FilterBar
        primaryFilterLabel={primaryFilterLabel}
        primaryFilterOptions={primaryFilterOptions}
        secondaryFilterLabel={secondaryFilterLabel}
        secondaryFilterOptions={secondaryFilterOptions}
        instrumentOptions={instrumentOptions}
        sortOptions={['Staff Picks', 'Duration']}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onFiltersChange={() => {}}
      />

      {/* Asset List */}
      <div className="tracks-container">
        <div className="tracks-list">
          {sortedAssets.map((asset, index) => (
            <AssetRow key={asset.id} asset={asset} index={index} />
          ))}
        </div>

        {sortedAssets.length === 0 && (
          <div className="empty-tracks">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>No {pageTitle.toLowerCase()} found matching your filters</p>
            <button onClick={clearAllFilters} className="button button-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
