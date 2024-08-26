import { Client } from '@microsoft/microsoft-graph-client';
import OutlookIcon from '../assets/icons/outlook.svg';
import { CalendarEvent } from '../components/Calendar/types/CalendarEvent';

const createGraphClient = (token: string) => {
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    },
  });
};

export const loadOutlookEvents = async (monthStart: Date, accessToken: string): Promise<CalendarEvent[]> => {
  const graphClient = createGraphClient(accessToken);
  const startDateTime = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    const endDateTime = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);

  try {
    const response = await graphClient
      .api('/me/calendarview')
      .header('Prefer', 'outlook.timezone="UTC"')
      .header('Accept-Encoding', 'gzip')
      .query({
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
      })
      .get();
      console.log("response")

    return response.value?.map((event: any) => ({
      id: event.id,
      summary: event.subject,
      start: {
        dateTime: event.start?.dateTime,
        date: event.start?.date,
      },
      end: {
        dateTime: event.end?.dateTime,
        date: event.end?.date,
      },
      creator: {
        name: event.organizer?.emailAddress?.name || 'Unknown',
        email: event.organizer?.emailAddress?.address,
        photoUrl: OutlookIcon,
      },
      description: event.bodyPreview || 'No description provided',
      location: event.location?.displayName || 'No location provided',
    })) || [];
  } catch (error) {
    console.error('Error fetching Outlook events:', error);
    return [];
  }
};
