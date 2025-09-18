import React, { useState, useEffect } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  isGroupBased: boolean;
  groupIds: string[];
}

const GroupMembersPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
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
        console.error('Error fetching data for GroupMembersPage:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedTournament) {
      const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
          const tournament = tournaments.find(t => t.id === selectedTournament);
          if (tournament && tournament.isGroupBased) {
            const groupPromises = tournament.groupIds.map(groupId =>
              api.get<Group>(`/groups/${groupId}`).catch(err => {
                console.error(`Failed to fetch group ${groupId}:`, err);
                return null; // Return null for failed requests
              })
            );
            const groupResponses = await Promise.allSettled(groupPromises);
            const fetchedGroups = groupResponses
              .filter((result): result is PromiseFulfilledResult<AxiosResponse<Group>> =>
                result.status === 'fulfilled' && result.value !== null
              )
              .map(result => result.value.data);
            setGroups(fetchedGroups);
          } else {
            setGroups([]);
          }
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
  }, [selectedTournament, tournaments]);

  const getPlayerName = (id: string) => {
    const player = players.find(p => p.id === id);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        View Group Members
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <Card variant="outlined" sx={{ p: 3, mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="tournament-select-label">Select Tournament</InputLabel>
            <Select
              labelId="tournament-select-label"
              id="tournament-select"
              value={selectedTournament}
              label="Select Tournament"
              onChange={(e) => setSelectedTournament(e.target.value as string)}
              variant="outlined"
            >
              <MenuItem value="">-- Select a Tournament --</MenuItem>
              {tournaments.filter(t => t.isGroupBased).map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTournament && groups.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>No groups found for this tournament.</Alert>
          ) : selectedTournament && groups.length > 0 ? (
            <Grid container spacing={3}>
              {groups.map((group) => (
                <Grid item xs={12} key={group.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {group.name}
                      </Typography>
                      {group.playerIds.length === 0 ? (
                        <Typography sx={{ mt: 2 }}>No players in this group yet.</Typography>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Player Name</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {group.playerIds.map((playerId) => (
                                <TableRow key={playerId}>
                                  <TableCell>{getPlayerName(playerId)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ mt: 2 }}>Select a group-based tournament to view its members.</Typography>
          )}
        </Card>
      )}
    </Container>
  );
};

export default GroupMembersPage;
