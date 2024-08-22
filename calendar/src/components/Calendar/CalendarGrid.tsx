import { eachDayOfInterval, endOfMonth, getDay, isEqual, isToday, format } from 'date-fns';
import { CalendarEvent } from './types/CalendarEvent';
interface CalendarGridProps {
  firstDayOfMonth: Date;
  selectedDay: Date;
  events: CalendarEvent[];
  handleDayClick: (day: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ firstDayOfMonth, selectedDay, events, handleDayClick }) => {
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(firstDayOfMonth),
  });

  const colStartClasses = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];

  return (
    <div className="grid grid-cols-7 mt-2 text-sm">
      {days.map((day, dayIdx) => (
        <div
          key={day.toString()}
          className={`${dayIdx === 0 ? colStartClasses[getDay(day)] : ''} py-1.5`}
        >
          <button
            type="button"
            onClick={() => handleDayClick(day)}
            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
              isEqual(day, selectedDay) ? 'bg-gray-900 text-white' : isToday(day) ? 'text-red-500' : 'text-gray-900'
            }`}
          >
            <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
          </button>
          <div className="w-1 h-1 mx-auto mt-1">
            {events.some(event => {
              const eventDate = event.start.dateTime || event.start.date;
              return eventDate && isEqual(new Date(eventDate), day);
            }) && <div className="w-1 h-1 rounded-full bg-sky-500"></div>}
          </div>
        </div>
      ))}
    </div>
  );
};
