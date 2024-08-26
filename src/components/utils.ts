import { format } from "date-fns";

export const formatTimeSlot = (slot: { start: Date; end: Date; }) => {
    return `${format(slot.start, 'HH:mm')} - ${format(slot.end, 'HH:mm')}`;
  };