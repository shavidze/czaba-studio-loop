interface RouteAnnouncerProps {
  message: string;
}

export function RouteAnnouncer({ message }: RouteAnnouncerProps) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only" data-route-announcer="">
      {message}
    </div>
  );
}
