interface AddEventButtonProps {
    handleAddButton: () => void;
  }
  
  const AddEventButton= ({ handleAddButton } : AddEventButtonProps) => {
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={handleAddButton}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Add Event
        </button>
      </div>
    );
  };
  
  export default AddEventButton