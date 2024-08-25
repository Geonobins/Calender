import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarEvent } from '../Calendar/types/CalendarEvent';
import { Loader2, Trash2 } from 'lucide-react';
import clsx from 'clsx'; // For conditional classes

interface EventListProps {
  selectedDay: Date;
  events: CalendarEvent[];
  handleDeleteEvent: (eventId: string) => void;
  loading: boolean;
}

export const EventList = ({ selectedDay, events, handleDeleteEvent, loading }: EventListProps) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const formatDate = (date?: string) => {
    return date ? format(parseISO(date), 'h:mm a') : 'Unknown Time';
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

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
            <li key={event.id} className="flex flex-col space-y-1">
              <div
                className="flex items-center space-x-2 cursor-pointer"
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
                  className="hover:bg-slate-200 py-1 hover:shadow-md rounded-lg size-[30px]"
                  onClick={() => handleDeleteEvent(event.id)}
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
      </ol>
    </section>
  );
};
