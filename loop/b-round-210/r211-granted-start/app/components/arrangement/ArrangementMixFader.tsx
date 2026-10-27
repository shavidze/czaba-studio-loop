import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { useArrangementMixDraftStore } from '~/contexts/ArrangementContext';
import { studioLevelFaderFillStyle } from './studio-fader';

interface ArrangementMixFaderFillRange {
  min: number;
  max: number;
}

interface ArrangementMixFaderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'style' | 'aria-valuetext' | 'title' | 'children'
  > {
  draftKey: string;
  storedValue: number;
  toSliderValue: (value: number) => number;
  formatValueText: (value: number) => string;
  formatTitle?: (value: number) => string | undefined;
  fillRange?: ArrangementMixFaderFillRange;
  renderReadout?: (value: number) => ReactNode;
}

function useMixDraftValue(draftKey: string): number | undefined {
  const store = useArrangementMixDraftStore();
  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(draftKey, listener),
    [store, draftKey],
  );
  const read = useCallback(() => store.get(draftKey), [store, draftKey]);
  return useSyncExternalStore(subscribe, read, () => undefined);
}

const ArrangementMixFader = forwardRef<HTMLInputElement, ArrangementMixFaderProps>(
  (
    {
      draftKey,
      storedValue,
      toSliderValue,
      formatValueText,
      formatTitle,
      fillRange,
      renderReadout,
      ...props
    },
    ref,
  ) => {
    const draft = useMixDraftValue(draftKey);
    const value = draft ?? storedValue;
    const sliderValue = toSliderValue(value);
    return (
      <>
        <input
          ref={ref}
          type="range"
          value={sliderValue}
          aria-valuetext={formatValueText(value)}
          title={formatTitle?.(value)}
          style={
            fillRange
              ? studioLevelFaderFillStyle({
                  value: sliderValue,
                  min: fillRange.min,
                  max: fillRange.max,
                })
              : undefined
          }
          {...props}
        />
        {renderReadout?.(value)}
      </>
    );
  },
);

ArrangementMixFader.displayName = 'ArrangementMixFader';

export { ArrangementMixFader };
export type { ArrangementMixFaderProps };
