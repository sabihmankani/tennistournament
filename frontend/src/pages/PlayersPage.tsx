import React, { useEffect, useState } from 'react';
import AddPlayerForm from '../components/AddPlayerForm';
import { API_BASE_URL } from '../apiConfig';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  ranking: number;
}

interface PlayersPageProps {
  isAdminLoggedIn: boolean;
}

const PlayersPage: React.FC<PlayersPageProps> = ({ isAdminLoggedIn }) => {
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Player[] = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePlayerAdded = () => {
    fetchPlayers(); // Refresh the list after a player is added
  };

  const handleRemovePlayer = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchPlayers(); // Refresh the list after a player is removed
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Players</h2>
      {isAdminLoggedIn && <AddPlayerForm onPlayerAdded={handlePlayerAdded} />}

      <h3 className="mt-5">Current Players</h3>
      {players.length === 0 ? (
        <p>No players added yet.</p>
      ) : (
        <ul className="list-group">
          {players.map(player => (
            <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
              {player.firstName} {player.lastName} ({player.location}) - Ranking: {player.ranking}
              {isAdminLoggedIn && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemovePlayer(player.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayersPage;