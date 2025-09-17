import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tournamentsResponse = await api.get<Tournament[]>('/tournaments');
        setTournaments(tournamentsResponse.data);

        const playersResponse = await api.get<Player[]>('/players');
        setPlayers(playersResponse.data);
      } catch (err: any) {
        console.error('Error fetching data for GroupsPage:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get<Group[]>(`/tournaments/${selectedTournament}/groups`);
          setGroups(response.data);
        } catch (err: any) {
          console.error('Error fetching groups:', err);
          setError('Failed to fetch groups for the selected tournament.');
        } finally {
          setLoading(false);
        }
      };
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [selectedTournament]);

  const handleAddGroup = async () => {
    if (!selectedTournament || !newGroupName) return;

    try {
      const response = await api.post<Group>(`/tournaments/${selectedTournament}/groups`, { name: newGroupName });
      setGroups([...groups, response.data]);
      setNewGroupName('');
    } catch (err: any) {
      console.error('Error adding group:', err);
      setError('Failed to add group. Max 5 groups allowed.');
    }
  };

  const handlePlayerSelectionChange = async (groupId: string, selectedPlayerIds: string[]) => {
    try {
      await api.put(`/groups/${groupId}/players`, { playerIds: selectedPlayerIds });
      // Refresh groups
      const response = await api.get<Group[]>(`/tournaments/${selectedTournament}/groups`);
      setGroups(response.data);
    } catch (err: any) {
      console.error('Error updating players in group:', err);
      setError('Failed to update players in group.');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Group Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="tournament-select-label">Select Tournament</InputLabel>
            <Select
              labelId="tournament-select-label"
              id="tournament-select"
              value={selectedTournament}
              label="Select Tournament"
              onChange={(e) => setSelectedTournament(e.target.value as string)}
            >
              <MenuItem value="">-- Select a Tournament --</MenuItem>
              {tournaments.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTournament && (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
                Groups
              </Typography>
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="New Group Name"
                  variant="outlined"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddGroup}>
                  Add Group
                </Button>
              </Box>

              {groups.length === 0 ? (
                <Typography>No groups for this tournament yet. Add one above.</Typography>
              ) : (
                groups.map((group) => (
                  <Card key={group.id} sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {group.name}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Players
                      </Typography>
                      <Grid container spacing={1}>
                        {players.map((player) => (
                          <Grid item xs={12} sm={6} md={4} key={player.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={group.playerIds.includes(player.id)}
                                  onChange={(e) => {
                                    const newPlayerIds = e.target.checked
                                      ? [...group.playerIds, player.id]
                                      : group.playerIds.filter((id) => id !== player.id);
                                    handlePlayerSelectionChange(group.id, newPlayerIds);
                                  }}
                                />
                              }
                              label={`${player.firstName} ${player.lastName}`}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default GroupsPage;
