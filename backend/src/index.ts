import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; // Import mongoose for ObjectId
import connectDB from './db';
import { Player, Tournament, Group, Match, IPlayer, ITournament, IGroup, IMatch } from './models';
import { calculateOverallRanking, calculateTournamentRanking } from './utils/ranking'; // These will need updates

const app = express();
const port = 3001;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Helper to convert Mongoose documents to plain objects with 'id' instead of '_id'
const formatDoc = (doc: any) => {
  if (!doc) return null;
  const obj = doc.toObject({ getters: true, virtuals: false });
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// --- API Routes ---

// Players
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players.map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const newPlayer = new Player(req.body);
    await newPlayer.save();
    res.status(201).json(formatDoc(newPlayer));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments.map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/tournaments', async (req, res) => {
  try {
    const { name, isGroupBased } = req.body;
    const newTournament = new Tournament({ name, isGroupBased, groupIds: [] });
    await newTournament.save();
    res.status(201).json(formatDoc(newTournament));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    // Optionally delete associated groups and matches here
    res.status(204).send();
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/tournaments/:id/groups', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('groupIds');
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament.groupIds.map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/tournaments/:id/groups', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.groupIds.length >= 5) {
      return res.status(400).json({ message: 'Maximum of 5 groups allowed per tournament' });
    }

    const { name } = req.body;
    const newGroup = new Group({ name, playerIds: [] });
    await newGroup.save();

    tournament.groupIds.push(newGroup._id);
    await tournament.save();

    res.status(201).json(formatDoc(newGroup));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/groups/:id/players', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { playerIds } = req.body;
    group.playerIds = playerIds;
    await group.save();

    res.json(formatDoc(group));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Matches
app.post('/api/matches', async (req, res) => {
  try {
    const { tournamentId, player1Id, player2Id, score1, score2, location, groupId } = req.body;

    const newMatch = new Match({
      tournamentId: new mongoose.Types.ObjectId(tournamentId as string),
      player1Id: new mongoose.Types.ObjectId(player1Id as string),
      player2Id: new mongoose.Types.ObjectId(player2Id as string),
      score1,
      score2,
      location,
      date: new Date(),
      groupId: groupId ? new mongoose.Types.ObjectId(groupId as string) : undefined,
    });
    await newMatch.save();
    res.status(201).json(formatDoc(newMatch));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches.map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/matches/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups.map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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

// Rankings (These functions in utils/ranking.ts will need to be updated to use MongoDB)
app.get('/api/rankings/overall', async (req, res) => {
  try {
    // This function needs to be updated to fetch data from MongoDB
    const rankings = await calculateOverallRanking();
    res.json(rankings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/rankings/tournament/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    // This function needs to be updated to fetch data from MongoDB
    const rankings = await calculateTournamentRanking(tournamentId);
    res.json(rankings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/rankings/tournament/:tournamentId/group/:groupId', async (req, res) => {
  try {
    const { tournamentId, groupId } = req.params;
    // This function needs to be updated to fetch data from MongoDB
    const rankings = await calculateTournamentRanking(tournamentId, groupId);
    res.json(rankings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Initialize Tournament (Pre-built)
app.post('/api/initialize-tournament', async (req, res) => {
  try {
    // Clear existing data
    await Player.deleteMany({});
    await Tournament.deleteMany({});
    await Match.deleteMany({});
    await Group.deleteMany({});

    // Create a new tournament
    const newTournament = new Tournament({
      name: 'Toronto Brothers Inaugural Championship',
      isGroupBased: true,
      groupIds: [],
    });

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

    const createdPlayers = await Player.insertMany(playerNames.map(p => ({
      firstName: p.first,
      lastName: p.last,
      location: p.location,
      ranking: Math.floor(Math.random() * 100) + 1,
    })));

    // Create two groups and assign players
    const group1 = new Group({
      name: 'Group A',
      playerIds: createdPlayers.slice(0, 5).map(p => p._id),
    });
    const group2 = new Group({
      name: 'Group B',
      playerIds: createdPlayers.slice(5, 10).map(p => p._id),
    });
    await group1.save();
    await group2.save();

    newTournament.groupIds.push(group1._id, group2._id);
    await newTournament.save();

    // Add some initial matches (example: 3 matches per group)
    const createMatchDoc = (p1: IPlayer, p2: IPlayer, tId: mongoose.Types.ObjectId, loc: string, s1: number, s2: number, gId?: mongoose.Types.ObjectId) => ({
      tournamentId: tId,
      player1Id: p1._id,
      player2Id: p2._id,
      score1: s1,
      score2: s2,
      location: loc,
      date: new Date(),
      groupId: gId,
    });

    const matchesToInsert = [
      createMatchDoc(createdPlayers[0], createdPlayers[1], newTournament._id, 'Court 1', 6, 4, group1._id),
      createMatchDoc(createdPlayers[2], createdPlayers[3], newTournament._id, 'Court 2', 7, 5, group1._id),
      createMatchDoc(createdPlayers[0], createdPlayers[2], newTournament._id, 'Court 1', 6, 2, group1._id),
      createMatchDoc(createdPlayers[5], createdPlayers[6], newTournament._id, 'Court 3', 6, 3, group2._id),
      createMatchDoc(createdPlayers[7], createdPlayers[8], newTournament._id, 'Court 4', 7, 6, group2._id),
      createMatchDoc(createdPlayers[5], createdPlayers[7], newTournament._id, 'Court 3', 6, 1, group2._id),
    ];
    await Match.insertMany(matchesToInsert);

    res.status(200).json({ message: 'Tournament initialized successfully!', tournament: formatDoc(newTournament) });
  } catch (error: any) {
    console.error("Error initializing tournament:", error);
    res.status(500).json({ message: 'Failed to initialize tournament.', error: error.message });
  }
});


app.get('/', (req, res) => {
  res.send('Hello from the Tennis Championship Backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
