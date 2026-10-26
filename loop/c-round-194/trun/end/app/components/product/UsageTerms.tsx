import { Briefcase, Check, Film, Globe, Radio, Tv, X, Youtube } from 'lucide-react';
import { ProductAccordion } from './ProductAccordion';

export function UsageTerms() {
  const allowedUses = [
    { icon: <Youtube size={16} />, text: 'YouTube videos (monetized)' },
    { icon: <Film size={16} />, text: 'Films, documentaries, trailers' },
    { icon: <Tv size={16} />, text: 'TV shows, commercials, ads' },
    { icon: <Radio size={16} />, text: 'Podcasts, radio, streaming' },
    { icon: <Briefcase size={16} />, text: 'Client work & freelance projects' },
    { icon: <Globe size={16} />, text: 'Social media (all platforms)' },
  ];

  const keyTerms = [
    'One purchase, unlimited use',
    'No credit or attribution required',
    'Unlimited projects, worldwide',
    'Lifetime license, never expires',
  ];

  const restrictions = [
    'Cannot resell or redistribute as-is',
    'Cannot claim ownership of the audio',
  ];

  return (
    <ProductAccordion title="License & Usage">
      <div className="border-t border-outline p-5 space-y-6">
        {/* Allowed Uses */}
        <div>
          <h3 className="text-xs text-dim uppercase tracking-wider mb-3">Use it for</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allowedUses.map((use, index) => (
              <div key={index} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className="text-brand">{use.icon}</span>
                <span>{use.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-outline/50" />

        {/* Key Terms */}
        <div>
          <h3 className="text-xs text-dim uppercase tracking-wider mb-3">Key terms</h3>
          <ul className="space-y-2">
            {keyTerms.map((term, index) => (
              <li key={index} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check size={14} className="text-brand shrink-0" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-outline/50" />

        {/* Restrictions */}
        <div>
          <h3 className="text-xs text-dim uppercase tracking-wider mb-3">Restrictions</h3>
          <ul className="space-y-2">
            {restrictions.map((restriction, index) => (
              <li key={index} className="flex items-center gap-2.5 text-sm text-muted">
                <X size={14} className="text-destructive/70 shrink-0" />
                <span>{restriction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-outline/50">
          <p className="text-xs text-dim text-center">
            Universal License - Personal & Commercial Use
          </p>
        </div>
      </div>
    </ProductAccordion>
  );
}
