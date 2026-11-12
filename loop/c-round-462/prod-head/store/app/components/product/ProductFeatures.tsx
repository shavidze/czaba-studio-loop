import { Award, Check, Download, FileAudio, Infinity, Music } from 'lucide-react';
import { ProductAccordion } from './ProductAccordion';

interface ProductFeaturesProps {
  // Dynamic features based on product
  trackCount?: number;
  fileFormats?: string[];
  fileSize?: string;
  quality?: string;
  productType?: 'Music' | 'Sound Effects' | 'Presets';
  hasStems?: boolean;
}

export function ProductFeatures({
  trackCount = 0,
  fileFormats = [],
  fileSize = '',
  quality = '',
  productType = 'Music',
  hasStems = false,
}: ProductFeaturesProps) {
  // Build features list based on product data
  const features: { icon: React.ReactNode; text: string }[] = [];

  // Track/file count
  if (trackCount > 0) {
    const label =
      productType === 'Music'
        ? 'tracks'
        : productType === 'Sound Effects'
          ? 'sound effects'
          : 'presets';
    features.push({
      icon: <Music size={16} />,
      text: `${trackCount} ${label} included`,
    });
  }

  // File formats
  if (fileFormats.length > 0) {
    features.push({
      icon: <FileAudio size={16} />,
      text: `${fileFormats.join(' + ')} format${fileFormats.length > 1 ? 's' : ''}`,
    });
  }

  // Quality
  if (quality) {
    features.push({
      icon: <Award size={16} />,
      text: `Audio quality: ${quality}`,
    });
  }

  // File size
  if (fileSize) {
    features.push({
      icon: <Download size={16} />,
      text: `Digital download (${fileSize})`,
    });
  }

  // Premium stems
  if (hasStems && productType === 'Music') {
    features.push({
      icon: <Check size={16} />,
      text: 'Individual stems included',
    });
  }

  // Standard features (always included)
  const standardFeatures = [
    'Pay once, use forever',
    'No subscription required',
    'Compatible with any editing software',
  ];

  return (
    <ProductAccordion title="What's Included">
      <div className="border-t border-outline p-5">
        <ul className="space-y-3">
          {/* Dynamic features */}
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-foreground">
              <span className="text-brand">{feature.icon}</span>
              <span>{feature.text}</span>
            </li>
          ))}

          {/* Standard features */}
          {standardFeatures.map((feature, index) => (
            <li key={`std-${index}`} className="flex items-center gap-3 text-sm text-foreground">
              <span className="text-brand">
                <Infinity size={16} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </ProductAccordion>
  );
}
