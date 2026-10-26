import { useCallback, useEffect, useState } from 'react';

// Waveform Component
export function WaveForm({
  isPlaying,
  progress,
  waveIndex,
}: {
  isPlaying: boolean;
  progress: number;
  waveIndex: number;
}) {
  const bars = 50;

  // 1. ვქმნით ფუნქციას, რომელიც აგენერირებს ბარების მასივს.
  // useCallback-ში ვსვამთ, რომ ყოველ render-ზე ხელახლა არ შეიქმნას.
  const generateBars = useCallback(() => {
    return Array.from({ length: bars }).map(() => {
      const height = Math.sin(((Math.random() * bars) / bars) * Math.PI) * 0.7 + 0.3;
      const randomVariation = 0.3 + Math.random() * 0.7;
      return height * randomVariation;
    });
  }, []);

  // 2. ვქმნით state-ს, სადაც შევინახავთ ბარების სიმაღლეებს.
  // საწყის მნიშვნელობას ვაძლევთ ერთხელ დაგენერირებულ სტატიკურ ფორმას.
  const [barsData, setBarsData] = useState<number[]>([]);

  useEffect(() => {
    setBarsData(generateBars());
  }, [generateBars]);

  // 3. ვიყენებთ useEffect-ს, რომელიც აკონტროლებს "ანიმაციას".
  // ეს კოდი გაეშვება ყოველთვის, როდესაც isPlaying შეიცვლება.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setBarsData(generateBars()), 150);
    return () => clearInterval(id);
  }, [isPlaying, generateBars]);

  return (
    <div className="waveform-container" key={waveIndex}>
      {barsData.map((finalHeight, i) => {
        const isActive = (i / bars) * 100 <= progress && isPlaying;

        return (
          <div
            key={i}
            className={`waveform-bar ${isActive ? 'active' : ''} ${isPlaying ? 'playing' : ''}`}
            style={{
              height: `${finalHeight * 100}%`,
            }}
          />
        );
      })}
    </div>
  );
}
