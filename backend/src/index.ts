import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import connectDB from './db';
import { Player, Match, WeeklyMatch, RateLimit } from './models';
import { calculateOverallRanking } from './utils/ranking';

interface AuthRequest extends Request {
  isAdmin?: boolean;
}

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Allow all origins (small private app, JWT-based auth — no cookie issues)
app.use(cors());
app.use(express.json());

const formatDoc = (doc: any) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ getters: true, virtuals: false }) : { ...doc };
  obj.id = (obj._id || obj.id).toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// Auth middleware
app.use((req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { isAdmin: boolean };
      if (decoded.isAdmin) req.isAdmin = true;
    } catch {
      // invalid token — not granted
    }
  }
  next();
});

// Connect DB on every request (cached after first connection)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// Players
// ──────────────────────────────────────────────

app.get('/api/players', async (_req, res) => {
  try {
    const players = await Player.find().sort({ firstName: 1 });
    res.json(players.map(formatDoc));
  } catch { res.status(500).send('Server Error'); }
});

app.post('/api/players', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Name required' });
    const player = new Player({ firstName: firstName.trim(), lastName: lastName.trim() });
    await player.save();
    res.status(201).json(formatDoc(player));
  } catch { res.status(500).send('Server Error'); }
});

app.delete('/api/players/:id', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.status(204).send();
  } catch { res.status(500).send('Server Error'); }
});

// ──────────────────────────────────────────────
// Matches
// ──────────────────────────────────────────────

app.get('/api/matches', async (_req, res) => {
  try {
    const matches = await Match.find().populate('player1Id player2Id').sort({ date: -1 });
    res.json(matches.map(formatDoc));
  } catch { res.status(500).send('Server Error'); }
});

app.post('/api/matches', async (req: AuthRequest, res) => {
  const ip = req.ip || 'unknown';

  if (!req.isAdmin) {
    try {
      const rateLimit = await RateLimit.findOne({ identifier: ip });
      const now = new Date();

      if (rateLimit?.blockedUntil && rateLimit.blockedUntil > now) {
        const days = Math.ceil((rateLimit.blockedUntil.getTime() - now.getTime()) / 86400000);
        return res.status(429).json({ message: `Blocked for ${days} more day(s).` });
      }
      if (rateLimit && (now.getTime() - rateLimit.lastMatchTimestamp.getTime()) < 60000) {
        return res.status(429).json({ message: 'Please wait 1 minute between submissions.' });
      }
      const isNewDay = !rateLimit || rateLimit.dailyCountTimestamp < new Date(now.getTime() - 86400000);
      const dailyCount = isNewDay ? 0 : (rateLimit?.dailyMatchCount || 0);
      if (dailyCount >= 20) {
        await RateLimit.findOneAndUpdate(
          { identifier: ip },
          { blockedUntil: new Date(now.getTime() + 30 * 86400000) },
          { upsert: true }
        );
        return res.status(429).json({ message: 'Daily limit exceeded.' });
      }
    } catch { return res.status(500).send('Server Error'); }
  }

  try {
    const { player1Id, player2Id, score1, score2 } = req.body;
    if (!player1Id || !player2Id) return res.status(400).json({ message: 'Both players required' });
    if (player1Id === player2Id) return res.status(400).json({ message: 'Players must differ' });

    const s1 = Number(score1);
    const s2 = Number(score2);
    if (!((s1 === 6 && s2 >= 0 && s2 <= 5) || (s2 === 6 && s1 >= 0 && s1 <= 5))) {
      return res.status(400).json({ message: 'Invalid score: winner must have 6, loser 0–5.' });
    }

    const match = new Match({
      player1Id: new mongoose.Types.ObjectId(player1Id),
      player2Id: new mongoose.Types.ObjectId(player2Id),
      score1: s1, score2: s2, date: new Date(), ipAddress: ip,
    });
    await match.save();

    const now = new Date();
    await RateLimit.findOneAndUpdate(
      { identifier: ip },
      { $set: { lastMatchTimestamp: now, dailyCountTimestamp: now }, $inc: { dailyMatchCount: 1 } },
      { upsert: true }
    );

    const populated = await match.populate('player1Id player2Id');
    res.status(201).json(formatDoc(populated));
  } catch { res.status(500).send('Server Error'); }
});

app.delete('/api/matches/:id', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch { res.status(500).send('Server Error'); }
});

// ──────────────────────────────────────────────
// Rankings
// ──────────────────────────────────────────────

app.get('/api/rankings/overall', async (_req, res) => {
  try {
    res.json(await calculateOverallRanking());
  } catch { res.status(500).send('Server Error'); }
});

app.get('/api/rankings/head-to-head', async (_req, res) => {
  try {
    const players = await Player.find().sort({ firstName: 1 });
    const matches = await Match.find();

    const h2h: Record<string, Record<string, { score1: number; score2: number } | null>> = {};
    players.forEach(p => {
      h2h[p._id.toString()] = {};
      players.forEach(opp => {
        if (opp._id.toString() !== p._id.toString())
          h2h[p._id.toString()][opp._id.toString()] = null;
      });
    });

    matches.forEach(match => {
      const p1 = match.player1Id.toString();
      const p2 = match.player2Id.toString();
      if (h2h[p1]) h2h[p1][p2] = { score1: match.score1, score2: match.score2 };
      if (h2h[p2]) h2h[p2][p1] = { score1: match.score2, score2: match.score1 };
    });

    res.json({ players: players.map(formatDoc), h2h });
  } catch { res.status(500).send('Server Error'); }
});

// ──────────────────────────────────────────────
// Weekly Schedule (public read, admin write)
// ──────────────────────────────────────────────

app.get('/api/weekly-matches', async (_req, res) => {
  try {
    const weekly = await WeeklyMatch.find()
      .populate('player1Id player2Id')
      .sort({ createdAt: 1 });

    const result = await Promise.all(weekly.map(async wm => {
      const p1 = wm.player1Id.toString();
      const p2 = wm.player2Id.toString();

      // Check if this match has been recorded after the weekly entry was created
      const recorded = await Match.findOne({
        $or: [
          { player1Id: new mongoose.Types.ObjectId(p1), player2Id: new mongoose.Types.ObjectId(p2) },
          { player1Id: new mongoose.Types.ObjectId(p2), player2Id: new mongoose.Types.ObjectId(p1) },
        ],
        date: { $gte: wm.createdAt },
      }).populate('player1Id player2Id');

      const formatted = formatDoc(wm);
      formatted.isCompleted = !!recorded;
      formatted.completedMatch = recorded ? formatDoc(recorded) : null;
      return formatted;
    }));

    res.json(result);
  } catch { res.status(500).send('Server Error'); }
});

// Add a match to this week's schedule
app.post('/api/admin/weekly-matches', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { player1Id, player2Id, weekLabel } = req.body;
    if (!player1Id || !player2Id) return res.status(400).json({ message: 'Both players required' });
    const wm = new WeeklyMatch({
      player1Id: new mongoose.Types.ObjectId(player1Id),
      player2Id: new mongoose.Types.ObjectId(player2Id),
      weekLabel: weekLabel || '',
    });
    await wm.save();
    const populated = await wm.populate('player1Id player2Id');
    res.status(201).json(formatDoc(populated));
  } catch { res.status(500).send('Server Error'); }
});

// Remove one weekly match
app.delete('/api/admin/weekly-matches/:id', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    await WeeklyMatch.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch { res.status(500).send('Server Error'); }
});

// Clear all weekly matches (reset the schedule)
app.delete('/api/admin/weekly-matches', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    await WeeklyMatch.deleteMany({});
    res.status(204).send();
  } catch { res.status(500).send('Server Error'); }
});

// Update the week label on all current matches
app.put('/api/admin/weekly-matches/label', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { weekLabel } = req.body;
    await WeeklyMatch.updateMany({}, { weekLabel: weekLabel || '' });
    res.json({ message: 'Label updated' });
  } catch { res.status(500).send('Server Error'); }
});

// ──────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'UsmanisKing') {
    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/admin/match-logs', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const matches = await Match.find().sort({ date: -1 }).populate('player1Id player2Id');
    res.json(matches.map(formatDoc));
  } catch { res.status(500).send('Server Error'); }
});

// Wipe all data (players, matches, ratelimits, weekly) — use with caution
app.delete('/api/admin/clear-all', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    await Promise.all([
      Player.deleteMany({}),
      Match.deleteMany({}),
      WeeklyMatch.deleteMany({}),
      RateLimit.deleteMany({}),
    ]);
    res.json({ message: 'All data cleared.' });
  } catch { res.status(500).send('Server Error'); }
});

app.get('/', (_req, res) => {
  res.send('SBP Summer Tennis League 2026 — Backend running.');
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Backend at http://localhost:${port}`));
}
