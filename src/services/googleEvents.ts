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
      headers: {
        'Accept-Encoding': 'gzip', // Request gzip-encoded response
        'User-Agent': 'my program (gzip)' // Optional, but can be helpful
    }
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
      eventSource: "google"
    })) || [];
  } catch (error) {
    console.error('Error fetching Google events:', error);
    return [];
  }
};


export const deleteGoogleEvent = async (eventId: string): Promise<void> => {
  console.log("hello deleting an event")
  try {
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    console.log('Google event deleted successfully');
  } catch (error) {
    console.error('Error deleting Google event:', error);
  }
};

export const addEventToGoogle = async (
  eventData: {
    summary: string;
    location: string;
    description: string;
    startTime: string;
    endTime: string;
  },
  selectedDay: Date
) => {
  const startDateTime = new Date(selectedDay);
  const [startHours, startMinutes] = eventData.startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes);

  const endDateTime = new Date(selectedDay);
  const [endHours, endMinutes] = eventData.endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes);

  const addedEvent = {
    summary: eventData.summary,
    location: eventData.location,
    description: eventData.description,
    start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Los_Angeles' },
    end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Los_Angeles' },
    attendees: [{ email: 'example@example.com' }],
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 24 * 60 }, { method: 'popup', minutes: 10 }] },
  };

  const request = gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: addedEvent,
  });

  request.execute(() => console.log("added to google"));
};