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

  let allEvents: CalendarEvent[] = [];
  let nextPageUrl = `/me/calendarview?startDateTime=${startDateTime.toISOString()}&endDateTime=${endDateTime.toISOString()}`;

  try {
    while (nextPageUrl) {
      const response = await graphClient
        .api(nextPageUrl)
        .header('Prefer', 'outlook.timezone="Asia/Kolkata"')
        .header('Accept-Encoding', 'gzip')
        .get();

        console.log("response",response)

      const events = response.value?.map((event: any) => ({
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
        eventSource: "outlook"
      })) || [];

      allEvents = [...allEvents, ...events];

      // Check if there's a next page of events
      nextPageUrl = response['@odata.nextLink'];
    }
  } catch (error) {
    console.error('Error fetching Outlook events:', error);
  }

  return allEvents;
};


export const deleteOutlookEvent = async (eventId: string, accessToken: string): Promise<void> => {
  const graphClient = createGraphClient(accessToken);

  try {
    await graphClient.api(`/me/events/${eventId}`).delete();
    console.log('Outlook event deleted successfully');
  } catch (error) {
    console.error('Error deleting Outlook event:', error);
  }
};

export const addEventToOutlook = async (
  eventData: {
    summary: string;
    location: string;
    description: string;
    startTime: string;
    endTime: string;
  },
  selectedDay: Date,
  accessToken: string,
  
): Promise<void> => {
  const graphClient = createGraphClient(accessToken);

  const startDateTime = new Date(selectedDay);
  const [startHours, startMinutes] = eventData.startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes);

  const endDateTime = new Date(selectedDay);
  const [endHours, endMinutes] = eventData.endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes);

  const newEvent = {
    subject: eventData.summary,
    body: {
      contentType: 'HTML',
      content: eventData.description,
    },
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    location: {
      displayName: eventData.location,
    },
    attendees: [
      {
        emailAddress: {
          address: 'example@example.com', // Add attendee email
        },
        type: 'required',
      },
    ],
  };

  try {
    await graphClient.api('/me/events').post(newEvent);
    console.log('Outlook event added successfully');
     
  } catch (error) {
    console.error('Error adding Outlook event:', error);
  }
};