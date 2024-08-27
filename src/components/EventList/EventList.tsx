import { useState } from 'react';
import { format, parseISO, isAfter, startOfHour, isBefore, endOfHour, addMinutes, endOfDay } from 'date-fns';
import { CalendarEvent } from '../Calendar/types/CalendarEvent';
import { Loader2, Trash2, ViewIcon } from 'lucide-react';
import clsx from 'clsx'; // For conditional classes
import { formatTimeSlot } from '../utils';

interface EventListProps {
  selectedDay: Date;
  events: CalendarEvent[];
  handleDeleteEvent: (eventId: string, eventSource: string) => void;
  loading: boolean;
  handleAddButton: (start:Date,end:Date) => void;
}

export const EventList = ({ selectedDay, events, handleDeleteEvent, loading, handleAddButton }: EventListProps) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'timeSlot'>('list');

  const [timeSlotInterval, setTimeSlotInterval] = useState(60); // Default to 60 minutes

  const generateTimeSlots = (interval: number) => {
    const slots = [];
    let currentTime = startOfHour(selectedDay); // Start from the beginning of the selected day
    console.log("endofhr",endOfDay(selectedDay))
    // Generate slots for the entire day
    while (currentTime < endOfDay(selectedDay)) {
      const endTime = addMinutes(currentTime, interval);
      slots.push({ start: currentTime, end: endTime });
      currentTime = endTime; // Move to the next slot
    }

    return slots;
  };

  const timeSlots = generateTimeSlots(timeSlotInterval); 

  const toggleView = () => {
    setView(view === 'list' ? 'timeSlot' : 'list');
  };
  const formatDate = (date?: string) => {
    return date ? format(parseISO(date), 'h:mm a') : 'Unknown Time';
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const handleDeleteClick = (eventId: string,eventSource: string,  e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the parent
    handleDeleteEvent(eventId, eventSource);
  };

  

  // Sort events by start dateTime
  const sortedEvents = [...events].sort((a, b) => {
    const startA = a.start.dateTime || a.start.date; 
    const startB = b.start.dateTime || b.start.date;
  
    // Use conditional logic to ensure both dates are strings before parsing
    if (startA && startB) {
      return isAfter(parseISO(startA), parseISO(startB)) ? 1 : -1;
    }
    // If either of the start times is missing, prioritize the one that exists
    if (startA) return -1;
    if (startB) return 1;
    return 0; // If both are missing, treat them as equal
  });
  const getEventStartTime = (event: CalendarEvent) => {
    const startDateTime = event.start.dateTime || event.start.date;
    
    return startDateTime ? parseISO(startDateTime) : startOfHour(selectedDay); // Use the start of the selected day as a fallback
  };
  const getEventEndTime = (event: CalendarEvent) => {
    const endDateTime = event.end.dateTime || event.end.date;
    
    return endDateTime ? parseISO(endDateTime) : endOfHour(selectedDay); // Use the start of the selected day as a fallback
  };

  const availableTimeSlots = timeSlots.filter((timeSlot) => {
    return !events.some((event) => {
      const eventStartTime = getEventStartTime(event);
      const eventEndTime = getEventEndTime(event);

      // Check if the time slot overlaps with any event
      return eventStartTime && eventEndTime && 
             isBefore(eventStartTime, timeSlot.end) && 
             isAfter(eventEndTime, timeSlot.start);
    });
  });
  
  
  

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="spinner-border animate-spin" role="status">
          <Loader2 />
        </div>
      </div>
    );
  }

  return (
    <section className="mt-12 md:mt-0 md:pl-14  max-h-[150px] sm:max-h-[300px]">
      
      <div className='flex justify-center items-center'>
      <div className="flex-1 font-semibold text-gray-900 flex gap-2 pb-3">
      Available slots:
      </div>
      <div className='flex gap-3'>
        <button onClick={()=>setTimeSlotInterval(60)} className=' border-2 p-0.5 px-1 rounded-xl hover:bg-slate-200 font-light text-md'>1hr</button>      
        <button onClick={()=>setTimeSlotInterval(30)} className='border-2 p-0.5 px-1 rounded-xl hover:bg-slate-200 font-light text-md'>30 min</button>
        <button onClick={()=>setTimeSlotInterval(15)} className='border-2 p-0.5 px-1 rounded-xl hover:bg-slate-200 font-light text-md'>15 min</button>
        </div>
      </div>
        <div className='flex gap-2 flex-wrap overflow-y-auto max-h-[150px] py-2 my-2 '>
          {availableTimeSlots.map((slot, index) => (
            <div key={index} className="p-2 bg-slate-100 cursor-pointer hover:bg-slate-200  rounded-2xl text-xs shadow-sm" onClick={()=>handleAddButton(slot.start,slot.end)}>
              {formatTimeSlot(slot)}
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-gray-900 flex gap-3 mt-6">
        Schedule for{' '}
        <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
          {format(selectedDay, 'MMM dd, yyyy')}
        </time>
        <button onClick={toggleView} className="mb-4 text-gray-500">
        <ViewIcon/>
      </button>
      </h2>

      {view === 'list' ? (
      <ol className=" space-y-1 text-sm max-h-[100px] sm:max-h-[200px] leading-6 overflow-y-auto text-gray-500">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <li key={event.id} className="flex flex-col space-y-1">
              <div
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-2xl hover:bg-gray-100 duration-500"
                onClick={() => toggleExpand(event.id)}
              >
                <div className="flex flex-1 gap-4">
                  <img
                    className="size-10"
                    src={event.creator?.photoUrl || 'https://via.placeholder.com/32'}
                    alt="Creator"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{event.summary}</p>
                    <p className="text-gray-500">
                      {formatDate(event.start.dateTime || event.start.date)} -{' '}
                      {formatDate(event.end.dateTime || event.end.date)}
                    </p>
                  </div>
                </div>
                <Trash2
                  className="hover:bg-slate-200 py-1 hover:shadow-md hover:text-red-400 hover:-translate-y-0.5 duration-500 rounded-lg size-[30px]"
                  onClick={(e) =>
                  {
                     handleDeleteClick(event.id, event.eventSource, e)
                    }
                  }
                />
              </div>
              <div
                className={clsx(
                  'transition-all duration-300 ease-in-out overflow-hidden',
                  expandedEventId === event.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                  <p>
                    <strong>Description:</strong> {event.description}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p>No events for today.</p>
        )}
      </ol>):
      (
        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[100px] sm:max-h-[200px] ">
          {timeSlots.map(({ start, end }, index) => (
            <div key={index} className="p-4 border rounded-md">
              <h3>{`${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`}</h3>
              <ul>
                {events
                  .filter((event) => {         
                    const eventStartTime = getEventStartTime(event);
                    const eventEndTime = getEventEndTime(event);
                    return eventStartTime && eventEndTime && 
                   isBefore(eventStartTime, end) && 
                   isAfter(eventEndTime, start);
          })
                  .map((event) => (
                    <li key={event.id}>
                      <p>{event.summary}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
