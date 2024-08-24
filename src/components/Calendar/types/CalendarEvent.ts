export interface CalendarEvent {
    id: string;
    summary: string;
    location: string;
    description: string;
    start: {
      dateTime?: string; // Optional, as events can be all-day events
      date?: string; // Optional, for all-day events
      timeZone?: string;
    };
    end: {
      dateTime?: string; // Optional
      date?: string; // Optional
      timeZone?: string;
    };
    creator: {
      displayName: string;
      photoUrl?: string; // Optional
    };
    attendees?: { email: string }[];
    reminders?: { useDefault: boolean; overrides?: { method: string; minutes: number }[]; };
  }