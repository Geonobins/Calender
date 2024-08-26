import { gapi } from 'gapi-script';
import GoogleIcon from '../../src/assets/icons/google.svg';
import { CalendarEvent } from '../components/Calendar/types/CalendarEvent';

export const loadGoogleEvents = async (monthStart: Date): Promise<CalendarEvent[]> => {
    const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    const endDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of the month

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.result.items.map((event: any) => ({
      id: event.id,
      summary: event.summary,
      start: {
        dateTime: event.start?.dateTime,
        date: event.start?.date,
      },
      end: {
        dateTime: event.end?.dateTime,
        date: event.end?.date,
      },
      creator: {
        name: event.creator?.email || 'Unknown',
        email: event.creator?.email,
        photoUrl: GoogleIcon,
      },
      description: event.description || 'No description provided',
      location: event.location || 'No location provided',
    })) || [];
  } catch (error) {
    console.error('Error fetching Google events:', error);
    return [];
  }
};
