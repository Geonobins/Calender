import { useState } from 'react';

interface EventModalProps {
  onClose: () => void;
  onSubmit: (eventData: { summary: string; location: string; description: string; startTime: string; endTime: string }) => void;
  start?: string;
  end?:string;
}

const EventModal = ({ onClose, onSubmit, start, end }: EventModalProps) => {
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(start || '');
  const [endTime, setEndTime] = useState(end || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ summary, location, description, startTime, endTime });
    onClose();
  };

  return (
    <div className="bg-white rounded-md flex items-center justify-center p-6 border">
      <div className="flex flex-col items-center gap-6">
        <div className='w-full justify-end flex'>
          <span className="bg-white px-2 cursor-pointer hover:bg-slate-200 rounded-lg" onClick={onClose}>&times;</span>
        </div>
        <h2 className='text-xl'>Add Event</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <label>Summary:</label>
          <input type="text" className='rounded-md border' value={summary} onChange={(e) => setSummary(e.target.value)} />

          <label>Location:</label>
          <input type="text" className='rounded-md border' value={location} onChange={(e) => setLocation(e.target.value)} />

          <label>Description:</label>
          <textarea className='rounded-md border' value={description} onChange={(e) => setDescription(e.target.value)} />

          <label>From Time:</label>
          <input type="time" className='rounded-md border' value={startTime} onChange={(e) => setStartTime(e.target.value)} />

          <label>To Time:</label>
          <input type="time" className='rounded-md border' value={endTime} onChange={(e) => setEndTime(e.target.value)} />

          <button type="submit" className='bg-slate-100 w-full rounded-lg shadow-md hover:bg-slate-200'>Add Event</button>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
