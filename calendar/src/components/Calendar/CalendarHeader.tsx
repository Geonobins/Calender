import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentMonth: Date;
  previousMonth: () => void;
  nextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentMonth, previousMonth, nextMonth }) => {
  return (
    <div className="flex items-center">
      <h2 className="flex-auto font-semibold text-gray-900">
        {format(currentMonth, 'MMMM yyyy')}
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
  );
};
