import React, { useEffect, useState } from 'react';
import { api } from '../apiConfig';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

interface PlayerRanking {
  player: Player;
  wins: number;
  losses: number;
  winLossRatio: number;
  setsWon: number;
  setsLost: number;
  setsRatio: number;
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

const RankingsPage: React.FC = () => {
  const [overallRankings, setOverallRankings] = useState<PlayerRanking[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [tournamentRankings, setTournamentRankings] = useState<PlayerRanking[]>([]);
  const [groupRankings, setGroupRankings] = useState<{ [key: string]: PlayerRanking[] }>({});
  const [loadingOverall, setLoadingOverall] = useState<boolean>(true);
  const [loadingTournament, setLoadingTournament] = useState<boolean>(false);
  const [errorOverall, setErrorOverall] = useState<string | null>(null);
  const [errorTournament, setErrorTournament] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingOverall(true);
      setErrorOverall(null);
      try {
        // Fetch overall rankings
        const overallResponse = await api.get<PlayerRanking[]>('/rankings/overall');
        setOverallRankings(overallResponse.data);

        // Fetch tournaments for dropdown
        const tournamentsResponse = await api.get<Tournament[]>('/tournaments');
        setTournaments(tournamentsResponse.data);

        // Fetch groups
        const groupsResponse = await api.get<Group[]>('/groups');
        setGroups(groupsResponse.data);

      } catch (err: any) {
        console.error("Error fetching data for RankingsPage:", err);
        setErrorOverall('Failed to fetch overall rankings or tournament data.');
      } finally {
        setLoadingOverall(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTournamentRankings = async () => {
      if (selectedTournament) {
        setLoadingTournament(true);
        setErrorTournament(null);
        const tournament = tournaments.find(t => t.id === selectedTournament);
        if (tournament?.isGroupBased) {
          // Fetch rankings for each group
          const groupRankingsData: { [key: string]: PlayerRanking[] } = {};
          for (const groupId of tournament.groupIds) {
            try {
              const response = await api.get<PlayerRanking[]>(`/rankings/tournament/${selectedTournament}/group/${groupId}`);
              groupRankingsData[groupId] = response.data;
            } catch (err: any) {
              console.error(`Error fetching group rankings for group ${groupId}:`, err);
              setErrorTournament('Failed to fetch group rankings.');
            }
          }
          setGroupRankings(groupRankingsData);
          setTournamentRankings([]); // Clear the old tournament-wide rankings
        } else {
          // Fetch non-group-based rankings
          try {
            const response = await api.get<PlayerRanking[]>(`/rankings/tournament/${selectedTournament}`);
            setTournamentRankings(response.data);
            setGroupRankings({}); // Clear group rankings
          } catch (err: any) {
            console.error("Error fetching tournament rankings:", err);
            setErrorTournament('Failed to fetch tournament rankings.');
          }
        }
        setLoadingTournament(false);
      } else {
        setTournamentRankings([]);
        setGroupRankings({});
      }
    };
    fetchTournamentRankings();
  }, [selectedTournament, tournaments]);

  const selectedTournamentDetails = tournaments.find(t => t.id === selectedTournament);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Player Rankings
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="h3" gutterBottom>
            Overall Rankings
          </Typography>
          {loadingOverall ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : errorOverall ? (
            <Alert severity="error" sx={{ mt: 2 }}>{errorOverall}</Alert>
          ) : overallRankings.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No overall rankings available yet.</Typography>
          ) : (
            <Paper elevation={2} sx={{ mt: 2 }}> {/* Wrap list in Paper for Material 3 feel */}
              <List>
                {overallRankings.map((ranking: PlayerRanking, index: number) => (
                  <ListItem key={ranking.player.id}>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          {index + 1}. {ranking.player.firstName} {ranking.player.lastName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Wins: {ranking.wins}, Losses: {ranking.losses} (Ratio: {ranking.winLossRatio.toFixed(2)})
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            Sets Won: {ranking.setsWon}, Sets Lost: {ranking.setsLost} (Ratio: {ranking.setsRatio.toFixed(2)})
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="h3" gutterBottom>
            Tournament Rankings
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="tournament-select-label">Select Tournament</InputLabel>
            <Select
              labelId="tournament-select-label"
              id="tournament-select"
              value={selectedTournament}
              label="Select Tournament"
              onChange={(e) => setSelectedTournament(e.target.value as string)}
              variant="outlined" // Material 3 default
            >
              <MenuItem value="">-- Select a Tournament --</MenuItem>
              {tournaments.map((tournament: Tournament) => (
                <MenuItem key={tournament.id} value={tournament.id}>
                  {tournament.name} {tournament.isGroupBased ? '(Group Based)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingTournament ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : errorTournament ? (
            <Alert severity="error" sx={{ mt: 2 }}>{errorTournament}</Alert>
          ) : selectedTournament && selectedTournamentDetails?.isGroupBased ? (
            // Display group-based rankings
            <Box>
              {selectedTournamentDetails.groupIds.map((groupId: string) => {
                const group = groups.find((g: Group) => g.id === groupId);
                const rankings = groupRankings[groupId] || [];

                return (
                  <Paper key={groupId} elevation={2} sx={{ mb: 4, p: 2 }}> {/* Wrap group rankings in Paper */}
                    <Typography variant="h6" component="h4" gutterBottom>
                      {group?.name || 'Unknown Group'} Rankings
                    </Typography>
                    {rankings.length === 0 ? (
                      <Typography sx={{ mt: 2 }}>No rankings for this group yet.</Typography>
                    ) : (
                      <List>
                        {rankings.map((ranking: PlayerRanking, index: number) => (
                          <ListItem key={ranking.player.id}>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1">
                                  {index + 1}. {ranking.player.firstName} {ranking.player.lastName}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Wins: {ranking.wins}, Losses: {ranking.losses} (Ratio: {ranking.winLossRatio.toFixed(2)})
                                  </Typography>
                                  <br />
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Sets Won: {ranking.setsWon}, Sets Lost: {ranking.setsLost} (Ratio: {ranking.setsRatio.toFixed(2)})
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                );
              })}
            </Box>
          ) : selectedTournament && tournamentRankings.length > 0 ? (
            // Display non-group-based rankings
            <Paper elevation={2} sx={{ mt: 2 }}> {/* Wrap list in Paper for Material 3 feel */}
              <List>
                {tournamentRankings.map((ranking: PlayerRanking, index: number) => (
                  <ListItem key={ranking.player.id}>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          {index + 1}. {ranking.player.firstName} {ranking.player.lastName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Wins: {ranking.wins}, Losses: {ranking.losses} (Ratio: {ranking.winLossRatio.toFixed(2)})
                            </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            Sets Won: {ranking.setsWon}, Sets Lost: {ranking.setsLost} (Ratio: {ranking.setsRatio.toFixed(2)})
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : selectedTournament ? (
            <Typography sx={{ mt: 2 }}>No rankings available for this tournament yet.</Typography>
          ) : (
            <Typography sx={{ mt: 2 }}>Select a tournament to view its rankings.</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RankingsPage;
