import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiConfig';
import {
  Typography,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface Player {
  firstName: string;
  lastName: string;
}

interface MatchLog {
  id: string;
  player1Id: Player;
  player2Id: Player;
  score1: number;
  score2: number;
  date: string;
  ipAddress: string;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [matchLogs, setMatchLogs] = useState<MatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    api.get<MatchLog[]>('/admin/match-logs')
      .then(res => setMatchLogs(res.data))
      .catch(() => setError('Failed to fetch match logs.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettingsIcon color="success" />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Admin Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Soul Brothers Pakistan Tennis Championship</Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Match Submission Log</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Player 1</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Player 2</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Winner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matchLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No matches submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                matchLogs.map((log, i) => {
                  const p1 = `${log.player1Id?.firstName || '?'} ${log.player1Id?.lastName || ''}`.trim();
                  const p2 = `${log.player2Id?.firstName || '?'} ${log.player2Id?.lastName || ''}`.trim();
                  const winnerName = log.score1 > log.score2 ? p1 : p2;
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>{matchLogs.length - i}</TableCell>
                      <TableCell>{p1}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {log.score1} – {log.score2}
                        </Typography>
                      </TableCell>
                      <TableCell>{p2}</TableCell>
                      <TableCell>
                        <Chip label={winnerName} size="small" color="success" />
                      </TableCell>
                      <TableCell>{new Date(log.date).toLocaleString('en-PK')}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary' }}>
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
