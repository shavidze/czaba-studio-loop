import { Fragment } from 'react';
import type { StudioTimeTextPart } from '~/lib/arrangement/strings';

export function ArrangementTimeText({ parts }: { parts: readonly StudioTimeTextPart[] }) {
  return (
    <>
      {parts.map((part) =>
        part.isTime ? (
          <span key={part.id} className="font-mono font-normal tabular-nums">
            {part.text}
          </span>
        ) : (
          <Fragment key={part.id}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
