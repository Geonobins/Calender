export interface CalendarEvent {
    id: string;
    summary: string;
    start: {
      dateTime?: string; // Optional, as events can be all-day events
      date?: string; // Optional, for all-day events
    };
    end: {
      dateTime?: string; // Optional
      date?: string; // Optional
    };
    creator: {
      displayName: string;
      photoUrl?: string; // Optional
    };
  }