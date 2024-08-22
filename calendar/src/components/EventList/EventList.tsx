import { format, parseISO } from 'date-fns';
import { CalendarEvent } from '../Calendar/types/CalendarEvent'

interface EventListProps {
  selectedDay: Date;
  events: CalendarEvent[];
}

export const EventList = ({ selectedDay, events } :EventListProps )  => {
  const formatDate = (date?: string) => {
    return date ? format(parseISO(date), 'h:mm a') : 'Unknown Time';
  };

  return (
    <section className="mt-12 md:mt-0 md:pl-14">
      <h2 className="font-semibold text-gray-900">
        Schedule for{' '}
        <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
          {format(selectedDay, 'MMM dd, yyyy')}
        </time>
      </h2>
      <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
        {events.length > 0 ? (
          events.map((event) => (
            <li key={event.id} className="flex items-center space-x-2">
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
            </li>
          ))
        ) : (
          <p>No events for today.</p>
        )}
      </ol>
    </section>
  );
};
