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
  Grid,
  CircularProgress,
  Alert,
  Paper // Added Paper for consistent styling
} from '@mui/material';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Tournament {
  id: string;
  name: string;
  isGroupBased: boolean;
  groupIds: string[];
}

interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

const AddMatchPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [player1, setPlayer1] = useState<string>('');
  const [player2, setPlayer2] = useState<string>('');
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentTournament = tournaments.find(t => t.id === selectedTournament);
  const isCurrentTournamentGroupBased = currentTournament?.isGroupBased;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tournamentsResponse = await api.get<Tournament[]>('/tournaments');
        setTournaments(tournamentsResponse.data);

        const playersResponse = await api.get<Player[]>('/players');
        setPlayers(playersResponse.data);

        const groupsResponse = await api.get<Group[]>('/groups');
        setGroups(groupsResponse.data);
      } catch (err: any) {
        console.error("Error fetching data for AddMatchPage:", err);
        setError('Failed to load data for match creation.');
      } finally {
        setLoading(false);
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
    setError(null);
    setSuccessMessage(null);

    if (!selectedTournament || !player1 || !player2 || player1 === player2) {
      setError("Please select a tournament and two different players.");
      return;
    }

    if (isCurrentTournamentGroupBased && !selectedGroup) {
      setError("Please select a group for this group-based tournament.");
      return;
    }

    const newMatch = {
      tournamentId: selectedTournament,
      player1Id: player1,
      player2Id: player2,
      score1,
      score2,
      location,
      groupId: isCurrentTournamentGroupBased ? selectedGroup : undefined,
    };

    try {
      await api.post('/matches', newMatch);

      setSuccessMessage('Match added successfully!');
      // Clear form
      setSelectedTournament('');
      setSelectedGroup('');
      setPlayer1('');
      setPlayer2('');
      setScore1(0);
      setScore2(0);
      setLocation('');
    } catch (err: any) {
      console.error("Error adding match:", err);
      setError('Failed to add match.');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Add New Match Score
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : successMessage ? (
        <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>
      ) : null}

      <Card elevation={3} sx={{ p: 4, mt: 2 }}> {/* Added elevation for Material 3 feel */}
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="tournament-select-label">Tournament</InputLabel>
              <Select
                labelId="tournament-select-label"
                id="tournament-select"
                value={selectedTournament}
                label="Tournament"
                onChange={(e) => {
                  setSelectedTournament(e.target.value as string);
                  setSelectedGroup('');
                  setPlayer1('');
                  setPlayer2('');
                }}
                required
                variant="outlined" // Material 3 default
              >
                <MenuItem value="">Select Tournament</MenuItem>
                {tournaments.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} {t.isGroupBased ? '(Group Based)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isCurrentTournamentGroupBased && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="group-select-label">Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  id="group-select"
                  value={selectedGroup}
                  label="Group"
                  onChange={(e) => {
                    setSelectedGroup(e.target.value as string);
                    setPlayer1('');
                    setPlayer2('');
                  }}
                  required
                  variant="outlined" // Material 3 default
                >
                  <MenuItem value="">Select Group</MenuItem>
                  {groups.filter(g => currentTournament && currentTournament.groupIds.includes(g.id)).map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="player1-select-label">Player 1</InputLabel>
              <Select
                labelId="player1-select-label"
                id="player1-select"
                value={player1}
                label="Player 1"
                onChange={(e) => setPlayer1(e.target.value as string)}
                required
                variant="outlined" // Material 3 default
              >
                <MenuItem value="">Select Player 1</MenuItem>
                {availablePlayers.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="player2-select-label">Player 2</InputLabel>
              <Select
                labelId="player2-select-label"
                id="player2-select"
                value={player2}
                label="Player 2"
                onChange={(e) => setPlayer2(e.target.value as string)}
                required
                variant="outlined" // Material 3 default
              >
                <MenuItem value="">Select Player 2</MenuItem>
                {availablePlayers.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Player 1 Score"
                  id="score1"
                  type="number"
                  value={score1}
                  onChange={(e) => setScore1(parseInt(e.target.value))}
                  required
                  variant="outlined" // Material 3 default
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Player 2 Score"
                  id="score2"
                  type="number"
                  value={score2}
                  onChange={(e) => setScore2(parseInt(e.target.value))}
                  required
                  variant="outlined" // Material 3 default
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Match Location"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              sx={{ mb: 3 }}
              variant="outlined" // Material 3 default
            />

            <Button type="submit" variant="contained" color="primary" size="large"> {/* Added size for Material 3 feel */}
              Add Match
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddMatchPage;