import React, { useEffect, useState } from 'react';
import AddTournamentForm from '../components/AddTournamentForm';

interface Tournament {
  id: string;
  name: string;
  groupIds: string[];
}

interface TournamentsPageProps {
  isAdminLoggedIn: boolean;
}

const TournamentsPage: React.FC<TournamentsPageProps> = ({ isAdminLoggedIn }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tournaments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Tournament[] = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleTournamentAdded = () => {
    fetchTournaments(); // Refresh the list after a tournament is added
  };

  const handleDeleteTournament = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/tournaments/${id}`,
          {
            method: 'DELETE',
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchTournaments(); // Refresh the list after deletion
      } catch (error) {
        console.error("Error deleting tournament:", error);
        alert('Failed to delete tournament.');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Tournaments</h2>
      {isAdminLoggedIn && <AddTournamentForm onTournamentAdded={handleTournamentAdded} />}

      <h3 className="mt-5">Current Tournaments</h3>
      {tournaments.length === 0 ? (
        <p>No tournaments added yet.</p>
      ) : (
        <ul className="list-group">
          {tournaments.map(tournament => (
            <li key={tournament.id} className="list-group-item d-flex justify-content-between align-items-center">
              {tournament.name}
              {isAdminLoggedIn && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteTournament(tournament.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TournamentsPage;