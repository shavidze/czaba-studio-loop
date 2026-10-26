/**
 * FXPackFeatures - Filmcrux-style feature stats for FX products
 * Shows key metrics in a clean, dark grid layout
 */

interface FXPackFeaturesProps {
  soundCount: number;
  format: string;
  quality: string;
  hasFullLicense?: boolean;
}

export function FXPackFeatures({
  soundCount,
  format,
  quality,
  hasFullLicense = true,
}: FXPackFeaturesProps) {
  const features = [
    {
      value: soundCount.toString(),
      label: 'Original Sounds',
    },
    {
      value: format.toUpperCase(),
      label: quality,
    },
    {
      value: hasFullLicense ? '100%' : 'Limited',
      label: 'Creative Freedom',
    },
  ];

  return (
    <div className="bg-black/50 border border-outline rounded-xl p-6">
      <div className="grid grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand mb-1">{feature.value}</div>
            <div className="text-sm text-muted tracking-wide">{feature.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
