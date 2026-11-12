function radioGroupNameOf(element: HTMLElement): string | null {
  if (element instanceof HTMLInputElement && element.type === 'radio' && element.name !== '') {
    return element.name;
  }
  return null;
}

export function groupDialogTabStops(focusable: readonly HTMLElement[]): HTMLElement[][] {
  const stops: HTMLElement[][] = [];
  const radioStopsByName = new Map<string, HTMLElement[]>();
  for (const element of focusable) {
    const groupName = radioGroupNameOf(element);
    if (groupName === null) {
      stops.push([element]);
      continue;
    }
    const existingStop = radioStopsByName.get(groupName);
    if (existingStop) {
      existingStop.push(element);
      continue;
    }
    const stop = [element];
    radioStopsByName.set(groupName, stop);
    stops.push(stop);
  }
  return stops;
}

export function dialogTabStopFocusTarget(stop: readonly HTMLElement[]): HTMLElement | null {
  const checkedRadio = stop.find(
    (element) => element instanceof HTMLInputElement && element.type === 'radio' && element.checked,
  );
  return checkedRadio ?? stop[0] ?? null;
}
