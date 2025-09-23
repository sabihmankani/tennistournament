import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import connectDB from './db';
import { Player, Tournament, Group, Match, RateLimit } from './models';
import { calculateOverallRanking, calculateTournamentRanking } from './utils/ranking';

// Extend Express Request type to include isAdmin
interface AuthRequest extends Request {
  isAdmin?: boolean;
}

const app = express();
app.set('trust proxy', 1); // Necessary for getting the correct IP address behind a proxy
const port = 3001;

// It's crucial to move this to an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Connect to Database
connectDB();

app.use(cors({ origin: 'https://tennistournament-d1rb.vercel.app' }));
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

// --- AUTH MIDDLEWARE ---
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
      if (decoded.isAdmin) {
        req.isAdmin = true;
      }
    } catch (err) {
      // Invalid token, but we don't block the request, just don't grant admin privileges
      console.log('Invalid JWT received');
    }
  }
  next();
};

// Apply auth middleware to all routes
app.use(authMiddleware);


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

app.post('/api/players', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
  try {
    const newPlayer = new Player(req.body);
    await newPlayer.save();
    res.status(201).json(formatDoc(newPlayer));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/players/:id', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
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

app.post('/api/tournaments', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
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

app.delete('/api/tournaments/:id', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
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
    res.json((tournament.groupIds as any).map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/tournaments/:id/groups', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
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

app.put('/api/groups/:id/players', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
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
app.post('/api/matches', async (req: AuthRequest, res) => {
  const ip = req.ip;

  if (!req.isAdmin) {
    try {
      let rateLimit = await RateLimit.findOne({ identifier: ip });
      const now = new Date();

      if (rateLimit && rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
        const remainingTime = Math.ceil((rateLimit.blockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return res.status(429).json({
          message: `You have been blocked from submitting matches for ${remainingTime} more days due to excessive submissions.`,
        });
      }

      if (rateLimit && (now.getTime() - rateLimit.lastMatchTimestamp.getTime()) < 5 * 60 * 1000) {
        return res.status(429).json({ message: 'You can only add one match every 5 minutes.' });
      }

      if (rateLimit && rateLimit.dailyCountTimestamp < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        rateLimit.dailyMatchCount = 0;
        rateLimit.dailyCountTimestamp = now;
      }
      
      if (rateLimit) {
        rateLimit.dailyMatchCount += 1;
        if (rateLimit.dailyMatchCount > 10) {
            rateLimit.blockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            await rateLimit.save();
            return res.status(429).json({ message: 'You have exceeded the maximum of 10 matches per 24 hours and are now blocked for 30 days.' });
        }
      }

    } catch (err: any) {
        console.error('Rate limiting error:', err.message);
        return res.status(500).send('Server Error during rate limit check');
    }
  }

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
      ipAddress: ip,
    });
    await newMatch.save();
    
    // Update rate limit info after successful save
    await RateLimit.findOneAndUpdate(
        { identifier: ip },
        { 
            $inc: { dailyMatchCount: 1 },
            $set: { lastMatchTimestamp: new Date(), dailyCountTimestamp: new Date() }
        },
        { upsert: true, new: true }
    );

    res.status(201).json(formatDoc(newMatch));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find().populate('player1Id player2Id tournamentId');
    res.json(matches.map(formatDoc));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/matches/:id', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
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

app.get('/api/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(formatDoc(group));
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/groups/:id', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ADMIN ROUTES ---

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  // In a real app, use bcrypt to compare hashed passwords
  if (username === 'admin' && password === 'UsmanisKing') {
    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/admin/match-logs', async (req: AuthRequest, res) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const matches = await Match.find().sort({ date: -1 }).populate('player1Id player2Id');
        res.json(matches.map(formatDoc));
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
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


app.get('/', (req, res) => {
  res.send('Hello from the Tennis Championship Backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});