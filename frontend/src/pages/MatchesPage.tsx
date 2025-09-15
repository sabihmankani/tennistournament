import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../apiConfig';

interface Match {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  location: string;
  date: string;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Tournament {
  id: string;
  name: string;
}

interface MatchesPageProps {
  isAdminLoggedIn: boolean;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ isAdminLoggedIn }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const fetchMatchesData = async () => {
    try {
      const matchesResponse = await fetch(`${API_BASE_URL}/api/matches`);
      const matchesData: Match[] = await matchesResponse.json();
      setMatches(matchesData);

      const playersResponse = await fetch(`${API_BASE_URL}/api/players`);
      const playersData: Player[] = await playersResponse.json();
      setPlayers(playersData);

      const tournamentsResponse = await fetch(`${API_BASE_URL}/api/tournaments`);
      const tournamentsData: Tournament[] = await tournamentsResponse.json();
      setTournaments(tournamentsData);

    } catch (error) {
      console.error("Error fetching matches data:", error);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, []);

  const getPlayerName = (id: string) => {
    const player = players.find(p => p.id === id);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  const getTournamentName = (id: string) => {
    const tournament = tournaments.find(t => t.id === id);
    return tournament ? tournament.name : 'Unknown Tournament';
  };

  const handleDeleteMatch = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/matches/${id}`,
          {
            method: 'DELETE',
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchMatchesData(); // Refresh the list after deletion
      } catch (error) {
        console.error("Error deleting match:", error);
        alert('Failed to delete match.');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Matches</h2>
      {matches.length === 0 ? (
        <p>No matches recorded yet.</p>
      ) : (
        <ul className="list-group">
          {matches.map(match => (
            <li key={match.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{getTournamentName(match.tournamentId)}:</strong> {getPlayerName(match.player1Id)} {match.score1} - {match.score2} {getPlayerName(match.player2Id)}
                <br />
                <small>Location: {match.location} | Date: {new Date(match.date).toLocaleDateString()}</small>
              </div>
              {isAdminLoggedIn && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteMatch(match.id)}
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

export default MatchesPage;