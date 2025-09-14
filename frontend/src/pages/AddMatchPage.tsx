import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Tournament {
  id: string;
  name: string;
  isGroupBased: boolean; // Added property
  groupIds: string[]; // Added property
}

interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

const AddMatchPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]); // New state for groups
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>(''); // New state for selected group
  const [player1, setPlayer1] = useState<string>('');
  const [player2, setPlayer2] = useState<string>('');
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [location, setLocation] = useState<string>('');

  const currentTournament = tournaments.find(t => t.id === selectedTournament);
  const isCurrentTournamentGroupBased = currentTournament?.isGroupBased;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentsResponse = await fetch('http://localhost:3001/api/tournaments');
        const tournamentsData: Tournament[] = await tournamentsResponse.json();
        setTournaments(tournamentsData);

        const playersResponse = await fetch('http://localhost:3001/api/players');
        const playersData: Player[] = await playersResponse.json();
        setPlayers(playersData);

        const groupsResponse = await fetch('http://localhost:3001/api/groups'); // Fetch groups
        const groupsData: Group[] = await groupsResponse.json();
        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching data for AddMatchPage:", error);
      }
    };
    fetchData();
  }, []);

  // Filter players based on selected group if tournament is group-based
  const availablePlayers = isCurrentTournamentGroupBased && selectedGroup
    ? players.filter(p => {
        const group = groups.find(g => g.id === selectedGroup);
        return group?.playerIds.includes(p.id);
      })
    : players;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTournament || !player1 || !player2 || player1 === player2) {
      alert("Please select a tournament and two different players.");
      return;
    }

    if (isCurrentTournamentGroupBased && !selectedGroup) {
      alert("Please select a group for this group-based tournament.");
      return;
    }

    const newMatch = {
      tournamentId: selectedTournament,
      player1Id: player1,
      player2Id: player2,
      score1,
      score2,
      location,
      groupId: isCurrentTournamentGroupBased ? selectedGroup : undefined, // Include groupId if group-based
    };

    try {
      const response = await fetch('http://localhost:3001/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMatch),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Match added successfully!');
      // Clear form
      setSelectedTournament('');
      setSelectedGroup(''); // Reset selected group
      setPlayer1('');
      setPlayer2('');
      setScore1(0);
      setScore2(0);
      setLocation('');
    } catch (error) {
      console.error("Error adding match:", error);
      alert('Failed to add match.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Add New Match Score</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="tournamentSelect" className="form-label">Tournament</label>
          <select
            className="form-select"
            id="tournamentSelect"
            value={selectedTournament}
            onChange={(e) => {
              setSelectedTournament(e.target.value);
              setSelectedGroup(''); // Reset group when tournament changes
              setPlayer1(''); // Reset players when tournament changes
              setPlayer2('');
            }}
            required
          >
            <option value="">Select Tournament</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.isGroupBased ? '(Group Based)' : ''}
              </option>
            ))}
          </select>
        </div>

        {isCurrentTournamentGroupBased && (
          <div className="mb-3">
            <label htmlFor="groupSelect" className="form-label">Group</label>
            <select
              className="form-select"
              id="groupSelect"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setPlayer1(''); // Reset players when group changes
                setPlayer2('');
              }}
              required
            >
              <option value="">Select Group</option>
              {groups.filter(g => currentTournament && currentTournament.groupIds.includes(g.id)).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="player1Select" className="form-label">Player 1</label>
          <select
            className="form-select"
            id="player1Select"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            required
          >
            <option value="">Select Player 1</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="player2Select" className="form-label">Player 2</label>
          <select
            className="form-select"
            id="player2Select"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            required
          >
            <option value="">Select Player 2</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="row mb-3">
          <div className="col">
            <label htmlFor="score1" className="form-label">Player 1 Score</label>
            <input
              type="number"
              className="form-control"
              id="score1"
              value={score1}
              onChange={(e) => setScore1(parseInt(e.target.value))}
              required
            />
          </div>
          <div className="col">
            <label htmlFor="score2" className="form-label">Player 2 Score</label>
            <input
              type="number"
              className="form-control"
              id="score2"
              value={score2}
              onChange={(e) => setScore2(parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">Match Location</label>
          <input
            type="text"
            className="form-control"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Add Match</button>
      </form>
    </div>
  );
};

export default AddMatchPage;
