import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { startOfToday, format, add, parse } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventList } from '../EventList/EventList';
import AddEventButton from '../Addbutton/AddButton';
import { CalendarEvent } from './types/CalendarEvent';
import EventModal from '../EventModal/EventModal';

export default function CalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState(startOfToday());
  const [currentMonth, setCurrentMonth] = useState(format(startOfToday(), 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  const CLIENT_ID = process.env.CLIENT_ID;
  const API_KEY = process.env.API_KEY;
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';

  useEffect(() => {
    const start = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        // Check if the user is already signed in
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance.isSignedIn.get()) {
          loadEvents(selectedDay); // Load events if already signed in
        } else {
          return authInstance.signIn().then(() => {
            loadEvents(selectedDay); // Load events after sign-in
          });
        }
      });
    };

    gapi.load('client:auth2', start);
  }, []);  // Removed selectedDay as a dependency

  useEffect(() => {
    loadEvents(selectedDay);
  }, [selectedDay]);  // Separate useEffect for loading events based on selectedDay

  const loadEvents = async (date: Date) => {
    const startDate = new Date(date.getTime()).setHours(0, 0, 0, 0);
    const endDate = new Date(date.getTime()).setHours(23, 59, 59, 999);

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(startDate).toISOString(),
        timeMax: new Date(endDate).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      setEvents(response.result.items);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setSelectedDay(firstDayNextMonth);
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setSelectedDay(firstDayNextMonth);
  };

  const handleAddEvent = async (eventData: { summary: any; location: any; description: any; }) => {
    const startDateTime = new Date(selectedDay);
    startDateTime.setHours(9); // Set start time to 9 AM
    const endDateTime = new Date(selectedDay);
    endDateTime.setHours(17); // Set end time to 5 PM

    const addedevent = {
      summary: eventData.summary,
      location: eventData.location,
      description: eventData.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: 'example@example.com' }, // Add attendees as needed
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: addedevent,
    });

    request.execute((event: { htmlLink: string }) => {
      console.log('Event created: ' + event.htmlLink);
      loadEvents(selectedDay); // Reload events after adding
    });
  };
  const handleAddButton = () =>
    {
      console.log("hellooowow")
      setIsModalOpen(true)
    } 

  return (
    <div className="pt-16 min-w-[80%] min-h-[600px] px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 bg-white z-40 border rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-gray-200  items-center justify-center z-40">
        <div className="md:pr-14 flex flex-col rounded-lg p-6 shadow-lg">
          <CalendarHeader
            currentMonth={firstDayCurrentMonth}
            previousMonth={previousMonth}
            nextMonth={nextMonth}
          />
          <CalendarGrid
            firstDayOfMonth={firstDayCurrentMonth}
            selectedDay={selectedDay}
            events={events}
            handleDayClick={handleDayClick}
          />
          <AddEventButton handleAddButton={handleAddButton} />
        </div>
        <EventList events={events} selectedDay={selectedDay} />
      </div>
      {
        isModalOpen &&
      <div className={`absolute  flex w-full h-full z-50  items-center justify-center inset-0`}>
        <EventModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAddEvent} 
        />
      </div>}
    </div>
  );
}