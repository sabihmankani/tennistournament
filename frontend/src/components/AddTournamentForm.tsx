import React, { useState } from 'react';

interface AddTournamentFormProps {
  onTournamentAdded: () => void;
}

const AddTournamentForm: React.FC<AddTournamentFormProps> = ({ onTournamentAdded }) => {
  const [tournamentName, setTournamentName] = useState('');
  const [isGroupBased, setIsGroupBased] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTournament = { name: tournamentName, isGroupBased };

    try {
      const response = await fetch('http://localhost:3001/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTournament),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTournamentName('');
      setIsGroupBased(false); // Reset checkbox
      onTournamentAdded(); // Notify parent component to refresh tournament list
    } catch (error) {
      console.error("Error adding tournament:", error);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h3>Add New Tournament</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="tournamentName" className="form-label">Tournament Name</label>
          <input
            type="text"
            className="form-control"
            id="tournamentName"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="isGroupBased"
            checked={isGroupBased}
            onChange={(e) => setIsGroupBased(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="isGroupBased">Group Based Tournament</label>
        </div>
        <button type="submit" className="btn btn-primary">Add Tournament</button>
      </form>
    </div>
  );
};

export default AddTournamentForm;
