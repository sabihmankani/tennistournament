import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

interface Tournament {
  id: string;
  name: string;
}

const GroupsPage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get('/tournaments');
        setTournaments(response.data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const response = await api.get('/players');
        setPlayers(response.data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchTournaments();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      const fetchGroups = async () => {
        try {
          const response = await api.get(`/tournaments/${selectedTournament}/groups`);
          setGroups(response.data);
        } catch (error) {
          console.error('Error fetching groups:', error);
        }
      };
      fetchGroups();
    }
  }, [selectedTournament]);

  const handleAddGroup = async () => {
    if (!selectedTournament || !newGroupName) return;

    try {
      const response = await api.post(`/tournaments/${selectedTournament}/groups`, { name: newGroupName });
      setGroups([...groups, response.data]);
      setNewGroupName('');
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handlePlayerSelectionChange = async (groupId: string, selectedPlayerIds: string[]) => {
    try {
      await api.put(`/groups/${groupId}/players`, { playerIds: selectedPlayerIds });
      // Refresh groups
      const response = await api.get(`/tournaments/${selectedTournament}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error updating players in group:', error);
    }
  };

  return (
    <div>
      <h1>Group Management</h1>

      <div className="mb-3">
        <label htmlFor="tournament-select" className="form-label">Select Tournament</label>
        <select
          id="tournament-select"
          className="form-select"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">-- Select a Tournament --</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTournament && (
        <div>
          <h2>Groups</h2>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="New Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={handleAddGroup}>
              Add Group
            </button>
          </div>

          {groups.map((group) => (
            <div key={group.id} className="card mb-3">
              <div className="card-header">{group.name}</div>
              <div className="card-body">
                <h5>Players</h5>
                <div className="row">
                  {players.map((player) => (
                    <div key={player.id} className="col-md-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`player-${group.id}-${player.id}`}
                          checked={group.playerIds.includes(player.id)}
                          onChange={(e) => {
                            const newPlayerIds = e.target.checked
                              ? [...group.playerIds, player.id]
                              : group.playerIds.filter((id) => id !== player.id);
                            handlePlayerSelectionChange(group.id, newPlayerIds);
                          }}
                        />
                        <label className="form-check-label" htmlFor={`player-${group.id}-${player.id}`}>
                          {player.firstName} {player.lastName}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;