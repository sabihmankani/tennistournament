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
  Box
} from '@mui/material';

// Define the interfaces for the data
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

// --- MatchLogTable Component ---
const MatchLogTable: React.FC = () => {
  const [matchLogs, setMatchLogs] = useState<MatchLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchLogs = async () => {
      try {
        const response = await api.get<MatchLog[]>('/admin/match-logs');
        setMatchLogs(response.data);
      } catch (err) {
        setError('Failed to fetch match logs. You may not have the required permissions.');
        console.error('Error fetching match logs:', err);
      }
      setLoading(false);
    };

    fetchMatchLogs();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" component="h3" sx={{ p: 2 }}>
        Match Submission Logs
      </Typography>
      <Table aria-label="match logs table">
        <TableHead>
          <TableRow>
            <TableCell>Player 1</TableCell>
            <TableCell>Player 2</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>IP Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matchLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">No match logs found.</TableCell>
            </TableRow>
          ) : (
            matchLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{`${log.player1Id?.firstName || 'N/A'} ${log.player1Id?.lastName || ''}`.trim()}</TableCell>
                <TableCell>{`${log.player2Id?.firstName || 'N/A'} ${log.player2Id?.lastName || ''}`.trim()}</TableCell>
                <TableCell align="center">{`${log.score1} - ${log.score2}`}</TableCell>
                <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


// --- AdminDashboardPage Component ---
const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin token exists
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin'); // Redirect to login if no token
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Admin Dashboard
        </Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
        Welcome, Admin!
      </Typography>
      
      {/* Match Log Table */}
      <MatchLogTable />

    </Container>
  );
};

export default AdminDashboardPage;