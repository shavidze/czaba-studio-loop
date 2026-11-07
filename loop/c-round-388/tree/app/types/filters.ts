// Filter Types for Asset Listing Pages

import type { Asset, AssetType } from './asset';

export type FilterType = 'primary' | 'secondary' | 'instrument';

export interface ActiveFilters {
  primary: string[];
  secondary: string[];
  instrument: string[];
}

export interface AssetListingPageProps {
  assets: Asset[];
  assetType: AssetType;
  primaryFilterLabel: string;
  primaryFilterOptions: string[];
  secondaryFilterLabel: string;
  secondaryFilterOptions: string[];
  instrumentOptions: string[];
  pageTitle: string;
}
