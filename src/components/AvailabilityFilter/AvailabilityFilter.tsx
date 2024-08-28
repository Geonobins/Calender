import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";


type Availability = {
    [key: string]: { from: string; to: string };
  };

type AvailabilityFilterProps = {
  handleCloseFilter: () => void;
  isFilterOpen: boolean;
  availability: Availability;
  setAvailability: (availabilitiy:Availability)=>void
};



export const AvailabilityFilter = ({ isFilterOpen, handleCloseFilter,availability,setAvailability }: AvailabilityFilterProps) => {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  

  const handleTimeChange = (day: string, timeType: "from" | "to", value: string) => {
    const updatedAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        [timeType]: value,
      },
    };
    setAvailability(updatedAvailability);
    
  };

  return (
    <Dialog open={isFilterOpen} onClose={handleCloseFilter} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed top-[10%] max-h-[85%] inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-sm transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl rounded-lg">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">Availability</DialogTitle>

                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={handleCloseFilter}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <hr className="mt-8" />

                  <div className="mt-8">
                    <div className="flow-root">
                      {weekdays.map((day) => (
                        <div key={day} className="flex flex-col my-4">
                          <label htmlFor={day} className="text-gray-700 font-semibold">
                            {day}
                          </label>
                          <div className="flex gap-2 mt-2">
                            <input
                              type="time"
                              id={`${day}-from`}
                              value={availability[day].from}
                              onChange={(e) => handleTimeChange(day, "from", e.target.value)}
                              className="border border-gray-300 rounded p-2"
                            />
                            <input
                              type="time"
                              id={`${day}-to`}
                              value={availability[day].to}
                              onChange={(e) => handleTimeChange(day, "to", e.target.value)}
                              className="border border-gray-300 rounded p-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
