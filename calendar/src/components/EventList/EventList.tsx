import { format, parseISO } from 'date-fns';
import { CalendarEvent } from '../Calendar/types/CalendarEvent'
import { Trash2 } from 'lucide-react';

interface EventListProps {
  selectedDay: Date;
  events: CalendarEvent[];
  handleDeleteEvent: (eventId: string) => void;
}

export const EventList = ({ selectedDay, events, handleDeleteEvent } :EventListProps )  => {
  const formatDate = (date?: string) => {
    return date ? format(parseISO(date), 'h:mm a') : 'Unknown Time';
  };

  return (
    <section className="mt-12 md:mt-0 md:pl-14 overflow-y-auto max-h-[150px] sm:max-h-[300px]">
      <h2 className="font-semibold text-gray-900">
        Schedule for{' '}
        <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
          {format(selectedDay, 'MMM dd, yyyy')}
        </time>
      </h2>
      <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
        {events.length > 0 ? (
          events.map((event) => (
            <li key={event.id} className="flex items-center space-x-2 ">
              <div className='flex flex-1 gap-4 '>
              <img
                src={event.creator.photoUrl || "https://via.placeholder.com/32"}
                alt={event.creator.displayName}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{event.summary}</p>
                <p className="text-gray-500">
                  {formatDate(event.start.dateTime || event.start.date)} -{' '}
                  {formatDate(event.end.dateTime || event.end.date)}
                </p>
              </div>
              </div>
              <Trash2 className=' hover:bg-slate-200 py-1 hover:shadow-md rounded-lg size-[30px]' onClick={() => handleDeleteEvent(event.id)}/>
            </li>
          ))
        ) : (
          <p>No events for today.</p>
        )}
      </ol>
    </section>
  );
};
