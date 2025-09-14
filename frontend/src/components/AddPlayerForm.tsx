import React, { useState } from 'react';

interface AddPlayerFormProps {
  onPlayerAdded: () => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onPlayerAdded }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [ranking, setRanking] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer = { firstName, lastName, location, ranking };

    try {
      const response = await fetch('http://localhost:3001/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFirstName('');
      setLastName('');
      setLocation('');
      setRanking(0);
      onPlayerAdded(); // Notify parent component to refresh player list
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h3>Add New Player</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="location" className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="ranking" className="form-label">Ranking</label>
          <input
            type="number"
            className="form-control"
            id="ranking"
            value={ranking}
            onChange={(e) => setRanking(parseInt(e.target.value))}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Player</button>
      </form>
    </div>
  );
};

export default AddPlayerForm;
