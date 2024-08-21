import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
} from 'date-fns';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string; // Optional, as events can be all-day events
    date: string; // Optional, for all-day events
  };
  end: {
    dateTime: string; // Optional
    date: string; // Optional
  };
  creator: {
    displayName: string;
    photoUrl?: string; // Optional
  };
}

const classNames = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
}

export default function CalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState(startOfToday());
  const [currentMonth, setCurrentMonth] = useState(format(startOfToday(), 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

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
        gapi.auth2.getAuthInstance().signIn().then(() => {
          loadEvents(selectedDay);
        });
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  const loadEvents = async (date: Date) => {
    // Use toISOString() directly for the API call
    const startDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();
  
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log("res",response)
      setEvents(response.result.items);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDayClick = (day:any) => {
    setSelectedDay(day);
    loadEvents(day);
  };

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setSelectedDay(firstDayNextMonth);
    loadEvents(firstDayNextMonth);
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setSelectedDay(firstDayNextMonth);
    loadEvents(firstDayNextMonth);
  };

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  // const selectedDayEvents = events.filter(event =>
  //   isSameDay(parseISO( event.start.dateTime || event.start.date), selectedDay)
  // );
  
  

  const handleAddEvent = () => {
    const startDateTime = new Date(selectedDay);
    startDateTime.setHours(9); // Set start time to 9 AM
    const endDateTime = new Date(selectedDay);
    endDateTime.setHours(17); // Set end time to 5 PM

    const addedevent = {
      summary: 'New Event',
      location: 'Some location',
      description: 'Event description here.',
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
  }
  

  let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7',
  ];

  return (
    <div className="pt-16">
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
        <div className="md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
          <div className="md:pr-14">
            <div className="flex items-center">
              <h2 className="flex-auto font-semibold text-gray-900">
                {format(firstDayCurrentMonth, 'MMMM yyyy')}
              </h2>
              <button
                type="button"
                onClick={previousMonth}
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={nextMonth}
                type="button"
                className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm">
              {days.map((day, dayIdx) => (
                <div
                  key={day.toString()}
                  className={classNames(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    'py-1.5'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={classNames(
                      isEqual(day, selectedDay) && 'text-white',
                      !isEqual(day, selectedDay) && isToday(day) && 'text-red-500',
                      !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'text-gray-900',
                      !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                      isEqual(day, selectedDay) && isToday(day) && 'bg-red-500',
                      isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
                      !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                      (isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                    )}
                  >
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'd')}
                    </time>
                  </button>
                  <div className="w-1 h-1 mx-auto mt-1">
                    {events.some(event =>
                      isSameDay(parseISO(event.start.dateTime || event.start.date ), day)
                    ) && (
                      <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <section className="mt-12 md:mt-0 md:pl-14">
            <h2 className="font-semibold text-gray-900">
              Schedule for{' '}
              <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
                {format(selectedDay, 'MMM dd, yyyy')}
              </time>
            </h2>
            <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
              {events.length > 0 ? (
                events.map(event => (
                  <li key={event.id} className="flex items-center space-x-2">
                    <img
                      src={event.creator.photoUrl || "https://via.placeholder.com/32"}
                      alt={event.creator.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{event.summary}</p>
                      <p className="text-gray-500">
                        {format(parseISO(event.start.dateTime || event.start.date), 'h:mm a')} -{' '}
                        {format(parseISO(event.end.dateTime || event.end.date), 'h:mm a')}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <p>No events for today.</p>
              )}
              <button className='p-3 shadow-lg border rounded-md font-extrabold' onClick={handleAddEvent}>Add Event</button>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}