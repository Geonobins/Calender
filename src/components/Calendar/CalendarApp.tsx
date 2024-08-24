import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { startOfToday, format, add, parse } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventList } from '../EventList/EventList';
import AddEventButton from '../Addbutton/AddButton';
import { CalendarEvent } from './types/CalendarEvent';
import EventModal from '../EventModal/EventModal';
import { PublicClientApplication } from "@azure/msal-browser";
import GoogleIcon from '../../assets/icons/google.svg';
import OutlookIcon from '../../assets/icons/outlook.svg';
import { initializeMsal } from '../../services/msalClient';
import { initializeGapi } from '../../services/gapiClient';
import { handleGoogleLogin, handleOutlookLogin } from '../../services/authUtils'; 
import { Client } from '@microsoft/microsoft-graph-client';


export default function CalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState(startOfToday());
  const [currentMonth, setCurrentMonth] = useState(format(startOfToday(), 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isOutlookSignedIn, setIsOutlookSignedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pca, setPca] = useState<PublicClientApplication | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  const CLIENT_ID = process.env.CLIENT_ID!;
  const API_KEY = process.env.API_KEY!;
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';

  const createGraphClient = (token: string) => {
    return Client.init({
      authProvider: (done) => {
        done(null, token); // Pass the access token to the auth provider
      },
    });
  };
  
  useEffect(() => {
    // Initialize both MSAL and GAPI
    initializeMsal(setPca); // Initialize MSAL and set the public client application
    initializeGapi(CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES, () => {
      loadGoogleEvents(selectedDay);  // Load Google events only after GAPI initialization
    });
  }, []);

  useEffect(() => {
    // Handle Google sign-in status
    const authInstance = gapi.auth2?.getAuthInstance();
    if (authInstance && authInstance.isSignedIn.get()) {
      setIsGoogleSignedIn(true);
    } else {
      setIsGoogleSignedIn(false);
    }
  
    // Handle Outlook sign-in status
    if (pca) {
      const activeAccount = pca.getActiveAccount();
      setIsOutlookSignedIn(!!activeAccount); // If there is an active account, the user is signed in
    }
  }, [pca]);
  
  const loadEvents = async (day: Date) => {
    const googleEvents = isGoogleSignedIn ? await loadGoogleEvents(day) : [];
    const outlookEvents = isOutlookSignedIn ? await loadOutlookEvents(day) : [];
    
    // Combine and set events
    setEvents([...googleEvents, ...outlookEvents]);
  };

  useEffect(() => {
    if (isGoogleSignedIn || isOutlookSignedIn) {
      loadEvents(selectedDay);
    }
  }, [selectedDay, isGoogleSignedIn, isOutlookSignedIn, accessToken]);

  
  const loadOutlookEvents = async (day: Date) => {
    if (!accessToken) {
      console.error('No access token available');
      return [];
    }
  
    const graphClient = createGraphClient(accessToken);
    const startDateTime = new Date(day.getTime()).setHours(0, 0, 0, 0);
    const endDateTime = new Date(day.getTime()).setHours(23, 59, 59, 999);
  
    try {
      const response = await graphClient
        .api('/me/calendarview')
        .header('Prefer', 'outlook.timezone="UTC"')
        .query({
          startDateTime: new Date(startDateTime).toISOString(),
          endDateTime: new Date(endDateTime).toISOString(),
        })
        .get();
  
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
          photoUrl: OutlookIcon, // Set Outlook icon as photoUrl
        },
      })) || [];
    } catch (error) {
      console.error('Error fetching Outlook events:', error);
      return [];
    }
  };
  
  
  const loadGoogleEvents = async (date: Date) => {
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
          photoUrl: GoogleIcon, // Set Google icon as photoUrl
        },
      })) || [];
    } catch (error) {
      console.error('Error fetching Google events:', error);
      return [];
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const previousMonth = () => {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPreviousMonth, 'MMM-yyyy'));
    setSelectedDay(firstDayPreviousMonth);
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setSelectedDay(firstDayNextMonth);
  };

  const handleAddEvent = async (eventData: { summary: string; location: string; description: string }) => {
    const startDateTime = new Date(selectedDay);
    startDateTime.setHours(9); // Start time: 9 AM
    const endDateTime = new Date(selectedDay);
    endDateTime.setHours(17); // End time: 5 PM

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

    request.execute(() => loadGoogleEvents(selectedDay)); // Reload events after adding
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const request = gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      request.execute(() => loadGoogleEvents(selectedDay)); // Reload events after deleting
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleAddButton = () => {
    setIsModalOpen(true);
  };

  return (
    <div className=' w-screen h-screen flex flex-col items-center justify-center'>
      <div className="absolute top-4 right-4 flex space-x-2 z-50">
        <button className="btn btn-primary" onClick={() => handleGoogleLogin(setIsGoogleSignedIn, loadGoogleEvents, selectedDay)}>
          <img
            src={GoogleIcon}
            className={`w-[80%] ${isGoogleSignedIn ? '' : 'grayscale'}`}
            alt="Google Login"
          />
        </button>

        <button onClick={() => {handleOutlookLogin(pca, setIsOutlookSignedIn,setAccessToken)}} className="btn btn-primary">
          <img
            src={OutlookIcon}
            className={`w-[80%] ${isOutlookSignedIn ? '' : 'grayscale'}`}
            alt="Outlook Login"
          />
        </button>
      </div>


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
              events={events?events:[]}
              handleDayClick={handleDayClick}
            />
            <AddEventButton handleAddButton={handleAddButton} />
          </div>
          <EventList events={events? events:[]} selectedDay={selectedDay} handleDeleteEvent={handleDeleteEvent} />
        </div>
        {
          isModalOpen &&
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white  rounded-lg shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <EventModal
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddEvent}
              />
            </div>
          </div>}
      </div>
    </div>
  );
}