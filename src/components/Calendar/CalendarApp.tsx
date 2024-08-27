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
import { loadGoogleEvents, deleteGoogleEvent, addEventToGoogle } from '../../services/googleEvents';
import { loadOutlookEvents, deleteOutlookEvent, addEventToOutlook } from '../../services/outlookEvents';


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
  const [loading, setLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]); // State for filtered events

  const [modalStartTime,setModalStartTime] = useState<string>('');
  const [modalEndTime,setModalEndTime] = useState<string>('');

  const CLIENT_ID = process.env.CLIENT_ID!;
  const API_KEY = process.env.API_KEY!;
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';

  useEffect(() => {
    // Initialize both MSAL and GAPI
    initializeMsal(setPca); // Initialize MSAL and set the public client application
    initializeGapi(CLIENT_ID, API_KEY, DISCOVERY_DOCS, SCOPES, () => {
       // Load Google events only after GAPI initialization
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

  const loadEvents = async () => {
    setLoading(true);
    
    const googleEvents = isGoogleSignedIn ? await loadGoogleEvents(firstDayCurrentMonth) : [];
    const outlookEvents = isOutlookSignedIn && accessToken ? await loadOutlookEvents(firstDayCurrentMonth, accessToken) : [];
  
    // Combine and set events
    setEvents([...googleEvents, ...outlookEvents]);
    setLoading(false);
  };
  const filterEventsForDay = (events: CalendarEvent[], day: Date) => {
    const filtered = events.filter(event => {
      const eventDateTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
      const eventDate = event.start.date ? new Date(event.start.date) : null;
  
      // Check if either eventDateTime or eventDate is not null
      return (eventDateTime && eventDateTime.toDateString() === day.toDateString()) || 
             (eventDate && eventDate.toDateString() === day.toDateString());
    });
    setFilteredEvents(filtered);
    console.log("eventsforday",filteredEvents)
  };
  

  useEffect(() => {
    if (isGoogleSignedIn || isOutlookSignedIn) {
      loadEvents();
    }
  }, [ currentMonth,isGoogleSignedIn, isOutlookSignedIn, accessToken]);

  useEffect(() => {
    filterEventsForDay(events, selectedDay); // Filter events whenever the selected day changes
  }, [events, selectedDay]);

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

  const handleAddEvent = async (eventData: { summary: string; location: string; description: string; startTime: string; endTime: string }) => {
    // Add event to Google Calendar if signed in
    if (isGoogleSignedIn) {
      await addEventToGoogle(eventData, selectedDay);
    }
  
    // Add event to Outlook Calendar if signed in
    if (isOutlookSignedIn && accessToken) {
      await addEventToOutlook(eventData, selectedDay, accessToken);
    }
    loadEvents();
  };
  

  const handleDeleteEvent = async (eventId: string, eventSource: string) => {
    try {
      if (eventSource === 'google') {
        
        await deleteGoogleEvent(eventId);
      } else if (eventSource === 'outlook') {
        if (accessToken) {
          await deleteOutlookEvent(eventId, accessToken);
        } else {
          throw new Error('Access token for Outlook is null');
        }
      }
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };
  

  const handleAddButton = (start?: Date, end?: Date) => {
    if (start && end)
    {
    setModalStartTime(format(start, 'HH:mm'));
    setModalEndTime(format(end, 'HH:mm'));
    }
    else{
      setModalStartTime("");
    setModalEndTime("");
    }
    setIsModalOpen(true);
  };

  return (
    <div className='w-screen min-h-full flex flex-col items-center justify-center'>
      <div className="absolute top-4 right-4 flex space-x-2 z-50">
        <button className="btn btn-primary" onClick={() => handleGoogleLogin(setIsGoogleSignedIn, loadGoogleEvents, selectedDay)}>
          <img
            src={GoogleIcon}
            className={`w-[80%] ${isGoogleSignedIn ? '' : 'grayscale'}`}
            alt="Google Login"
          />
        </button>
  
        <button onClick={() => { handleOutlookLogin(pca, setIsOutlookSignedIn, setAccessToken) }} className="btn btn-primary">
          <img
            src={OutlookIcon}
            className={`w-[80%] ${isOutlookSignedIn ? '' : 'grayscale'}`}
            alt="Outlook Login"
          />
        </button>
      </div>
  
      <div className="pt-16 min-w-[90%] h-full  sm:min-h-[600px] px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 bg-white z-40 border rounded-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-gray-200 items-center justify-center z-40">
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
              handleDayClick={setSelectedDay}
            />
            <AddEventButton handleAddButton={handleAddButton} />
          </div>
          <EventList events={filteredEvents} selectedDay={selectedDay} handleDeleteEvent={handleDeleteEvent} loading={loading} handleAddButton={handleAddButton} />
        </div>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <EventModal
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddEvent}
                start = {modalStartTime}
                end = {modalEndTime}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
