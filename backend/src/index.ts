import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors'; // Import cors
import { calculateOverallRanking, calculateTournamentRanking } from './utils/ranking';

const app = express();
const port = 3001;

app.use(cors()); // Use cors middleware
app.use(express.json());

// --- Interfaces for Data Models ---

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  ranking: number;
}

interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

interface Tournament {
  id: string;
  name: string;
  groupIds: string[];
  isGroupBased: boolean; // New property
}

interface Match {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  location: string;
  date: string; // ISO date string
  groupId?: string; // New optional property
}

// --- File System Utilities ---

const dataDir = path.join(__dirname, '../data');
const playersFilePath = path.join(dataDir, 'players.json');
const tournamentsFilePath = path.join(dataDir, 'tournaments.json');
const matchesFilePath = path.join(dataDir, 'matches.json');
const groupsFilePath = path.join(dataDir, 'groups.json'); // New groups file path

export function readJsonFile<T>(filePath: string): T[] {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // File not found, return empty array
    }
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

export function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}

// --- API Routes ---

// Players
app.get('/api/players', (req, res) => {
  const players = readJsonFile<Player>(playersFilePath);
  res.json(players);
});

app.post('/api/players', (req, res) => {
  const players = readJsonFile<Player>(playersFilePath);
  const newPlayer: Player = {
    id: Date.now().toString(), // Simple unique ID
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    location: req.body.location,
    ranking: req.body.ranking,
  };
  players.push(newPlayer);
  writeJsonFile(playersFilePath, players);
  res.status(201).json(newPlayer);
});

app.delete('/api/players/:id', (req, res) => {
  let players = readJsonFile<Player>(playersFilePath);
  const initialLength = players.length;
  players = players.filter(p => p.id !== req.params.id);
  if (players.length < initialLength) {
    writeJsonFile(playersFilePath, players);
    res.status(204).send(); // No Content
  } else {
    res.status(404).json({ message: 'Player not found' });
  }
});

// Tournaments
app.get('/api/tournaments', (req, res) => {
  const tournaments = readJsonFile<Tournament>(tournamentsFilePath);
  res.json(tournaments);
});

app.post('/api/tournaments', (req, res) => {
  const tournaments = readJsonFile<Tournament>(tournamentsFilePath);
  const newTournament: Tournament = {
    id: Date.now().toString(),
    name: req.body.name,
    groupIds: [],
    isGroupBased: req.body.isGroupBased || false,
  };

  if (newTournament.isGroupBased) {
    const groups = readJsonFile<Group>(groupsFilePath);
    const players = readJsonFile<Player>(playersFilePath);
    const playerIds = players.map(p => p.id);

    const group1Id = Date.now().toString() + '-1';
    const group2Id = Date.now().toString() + '-2';

    const group1: Group = {
      id: group1Id,
      name: 'Group A',
      playerIds: playerIds,
    };
    const group2: Group = {
      id: group2Id,
      name: 'Group B',
      playerIds: playerIds,
    };

    groups.push(group1, group2);
    newTournament.groupIds.push(group1Id, group2Id);
    writeJsonFile(groupsFilePath, groups);
  }

  tournaments.push(newTournament);
  writeJsonFile(tournamentsFilePath, tournaments);
  res.status(201).json(newTournament);
});

app.delete('/api/tournaments/:id', (req, res) => {
  let tournaments = readJsonFile<Tournament>(tournamentsFilePath);
  const initialLength = tournaments.length;
  tournaments = tournaments.filter(t => t.id !== req.params.id);
  if (tournaments.length < initialLength) {
    writeJsonFile(tournamentsFilePath, tournaments);
    res.status(204).send(); // No Content
  } else {
    res.status(404).json({ message: 'Tournament not found' });
  }
});

// Matches
app.post('/api/matches', (req, res) => {
  const matches = readJsonFile<Match>(matchesFilePath);
  const newMatch: Match = {
    id: Date.now().toString(),
    tournamentId: req.body.tournamentId,
    player1Id: req.body.player1Id,
    player2Id: req.body.player2Id,
    score1: req.body.score1,
    score2: req.body.score2,
    location: req.body.location,
    date: new Date().toISOString(),
    groupId: req.body.groupId || undefined, // New optional property
  };
  matches.push(newMatch);
  writeJsonFile(matchesFilePath, matches);
  res.status(201).json(newMatch);
});

app.get('/api/matches', (req, res) => {
  const matches = readJsonFile<Match>(matchesFilePath);
  res.json(matches);
});

app.delete('/api/matches/:id', (req, res) => {
  let matches = readJsonFile<Match>(matchesFilePath);
  const initialLength = matches.length;
  matches = matches.filter(m => m.id !== req.params.id);
  if (matches.length < initialLength) {
    writeJsonFile(matchesFilePath, matches);
    res.status(204).send(); // No Content
  } else {
    res.status(404).json({ message: 'Match not found' });
  }
});

// Groups
app.get('/api/groups', (req, res) => {
  const groups = readJsonFile<Group>(groupsFilePath);
  res.json(groups);
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;
  // For simplicity, hardcoded credentials
  if (username === 'admin' && password === 'UsmanisKing') {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Rankings
app.get('/api/rankings/overall', (req, res) => {
  const rankings = calculateOverallRanking();
  res.json(rankings);
});

app.get('/api/rankings/tournament/:tournamentId', (req, res) => {
  const { tournamentId } = req.params;
  const rankings = calculateTournamentRanking(tournamentId);
  res.json(rankings);
});

app.get('/api/rankings/tournament/:tournamentId/group/:groupId', (req, res) => {
  const { tournamentId, groupId } = req.params;
  const rankings = calculateTournamentRanking(tournamentId, groupId);
  res.json(rankings);
});

// Initialize Tournament (Pre-built)
app.post('/api/initialize-tournament', (req, res) => {
  try {
    let players = readJsonFile<Player>(playersFilePath);
    let tournaments = readJsonFile<Tournament>(tournamentsFilePath);
    let matches = readJsonFile<Match>(matchesFilePath);
    let groups = readJsonFile<Group>(groupsFilePath); // Read groups

    // Clear existing data for a fresh start (optional, for development)
    players = [];
    tournaments = [];
    matches = [];
    groups = []; // Clear groups

    // Create a new tournament
    const tournamentId = Date.now().toString();
    const newTournament: Tournament = {
      id: tournamentId,
      name: 'Toronto Brothers Inaugural Championship',
      groupIds: [],
      isGroupBased: true, // Set to true for pre-built tournament
    };
    tournaments.push(newTournament);

    // Create 10 players
    const playerNames = [
      { first: 'Alice', last: 'Smith', location: 'Toronto' },
      { first: 'Bob', last: 'Johnson', location: 'Mississauga' },
      { first: 'Charlie', last: 'Brown', location: 'Scarborough' },
      { first: 'Diana', last: 'Prince', location: 'North York' },
      { first: 'Eve', last: 'Davis', location: 'Etobicoke' },
      { first: 'Frank', last: 'White', location: 'Vaughan' },
      { first: 'Grace', last: 'Black', location: 'Richmond Hill' },
      { first: 'Harry', last: 'Green', location: 'Markham' },
      { first: 'Ivy', last: 'Blue', location: 'Brampton' },
      { first: 'Jack', last: 'Red', location: 'Oakville' },
    ];

    const createdPlayers: Player[] = playerNames.map((p, index) => ({
      id: (Date.now() + index).toString(),
      firstName: p.first,
      lastName: p.last,
      location: p.location,
      ranking: Math.floor(Math.random() * 100) + 1, // Random initial ranking
    }));
    players.push(...createdPlayers);

    // Create two groups and assign players
    const group1Id = (Date.now() + 1000).toString();
    const group2Id = (Date.now() + 2000).toString();

    const group1: Group = {
      id: group1Id,
      name: 'Group A',
      playerIds: createdPlayers.slice(0, 5).map(p => p.id),
    };
    const group2: Group = {
      id: group2Id,
      name: 'Group B',
      playerIds: createdPlayers.slice(5, 10).map(p => p.id),
    };
    groups.push(group1, group2); // Add groups to the list

    // Add groups to tournament
    newTournament.groupIds.push(group1.id, group2.id);

    // Add some initial matches (example: 3 matches per group)
    const createMatch = (p1: Player, p2: Player, tId: string, loc: string, s1: number, s2: number, gId?: string): Match => ({
      id: Date.now().toString() + Math.random().toString().substring(2, 5),
      tournamentId: tId,
      player1Id: p1.id,
      player2Id: p2.id,
      score1: s1,
      score2: s2,
      location: loc,
      date: new Date().toISOString(),
      groupId: gId, // Assign group ID to match
    });

    // Group A matches
    matches.push(createMatch(createdPlayers[0], createdPlayers[1], tournamentId, 'Court 1', 6, 4, group1.id));
    matches.push(createMatch(createdPlayers[2], createdPlayers[3], tournamentId, 'Court 2', 7, 5, group1.id));
    matches.push(createMatch(createdPlayers[0], createdPlayers[2], tournamentId, 'Court 1', 6, 2, group1.id));

    // Group B matches
    matches.push(createMatch(createdPlayers[5], createdPlayers[6], tournamentId, 'Court 3', 6, 3, group2.id));
    matches.push(createMatch(createdPlayers[7], createdPlayers[8], tournamentId, 'Court 4', 7, 6, group2.id));
    matches.push(createMatch(createdPlayers[5], createdPlayers[7], tournamentId, 'Court 3', 6, 1, group2.id));

    // Write all data back to files
    writeJsonFile(playersFilePath, players);
    writeJsonFile(tournamentsFilePath, tournaments);
    writeJsonFile(matchesFilePath, matches);
    writeJsonFile(groupsFilePath, groups); // Write groups to file

    res.status(200).json({ message: 'Tournament initialized successfully!', tournament: newTournament });
  } catch (error) {
    console.error("Error initializing tournament:", error);
    res.status(500).json({ message: 'Failed to initialize tournament.', error: (error as Error).message });
  }
});


app.get('/', (req, res) => {
  res.send('Hello from the Tennis Championship Backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});