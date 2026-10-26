import { useEffect, useState } from 'react';

export function PianoLoadingAnimation() {
  const [isVisible, setIsVisible] = useState(true);

  // Piano keys configuration (simplified - one octave + extras for visual appeal)
  const whiteKeys = 8; // C, D, E, F, G, A, B, C
  const blackKeyPositions = [1, 2, 4, 5, 6]; // Position after white keys

  useEffect(() => {
    // Auto-hide after animation completes (adjust timing as needed)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Animation duration + slight delay

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="piano-loading-overlay">
      <div className="piano-keys-container">
        {/* White Keys */}
        {Array.from({ length: whiteKeys }).map((_, index) => (
          <div
            key={`white-${index}`}
            className="piano-key white-key"
            style={{
              animationDelay: `${index * 0.08}s`,
            }}
          />
        ))}

        {/* Black Keys */}
        {blackKeyPositions.map((position, index) => (
          <div
            key={`black-${index}`}
            className="piano-key black-key"
            style={{
              left: `${position * 12.5 - 4}%`,
              animationDelay: `${position * 0.08 + 0.04}s`,
            }}
          />
        ))}

        {/* CZABA Logo/Text (optional) */}
        <div className="piano-loading-text">
          <div className="loading-brand">
            CZ<span style={{ color: '#ff3333' }}>A</span>B
            <span style={{ color: '#ff3333' }}>A</span>
          </div>
          <div className="loading-subtitle">Loading your music...</div>
        </div>
      </div>
    </div>
  );
}
