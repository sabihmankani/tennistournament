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

app.put('/api/players/:id', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Name required' });
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { firstName: firstName.trim(), lastName: lastName.trim() },
      { new: true }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(formatDoc(player));
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
    const validScore =
      (s1 === 6 && s2 >= 0 && s2 <= 5) ||
      (s2 === 6 && s1 >= 0 && s1 <= 5) ||
      (s1 === 7 && s2 === 5) ||
      (s2 === 7 && s1 === 5);
    if (!validScore) {
      return res.status(400).json({ message: 'Invalid score: winner must have 6 (loser 0–5) or 7-5.' });
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

    const h2h: Record<string, Record<string, { wins: number; losses: number; scores: { s1: number; s2: number }[] } | null>> = {};
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
      const p1won = match.score1 > match.score2;
      if (h2h[p1] !== undefined) {
        if (!h2h[p1][p2]) h2h[p1][p2] = { wins: 0, losses: 0, scores: [] };
        if (p1won) h2h[p1][p2]!.wins++; else h2h[p1][p2]!.losses++;
        h2h[p1][p2]!.scores.push({ s1: match.score1, s2: match.score2 });
      }
      if (h2h[p2] !== undefined) {
        if (!h2h[p2][p1]) h2h[p2][p1] = { wins: 0, losses: 0, scores: [] };
        if (p1won) h2h[p2][p1]!.losses++; else h2h[p2][p1]!.wins++;
        h2h[p2][p1]!.scores.push({ s1: match.score2, s2: match.score1 });
      }
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

    if (weekly.length === 0) return res.json([]);

    // Single batch query for all relevant matches instead of N sequential queries
    const earliest = weekly.reduce(
      (min, wm) => (wm.createdAt < min ? wm.createdAt : min),
      weekly[0].createdAt,
    );
    const allMatches = await Match.find({ date: { $gte: earliest } })
      .populate('player1Id player2Id')
      .lean();

    const result = (() => {
      const claimedIds = new Set<string>();
      return weekly.map(wm => {
        const p1id = (wm.player1Id as any)._id.toString();
        const p2id = (wm.player2Id as any)._id.toString();

        const recorded = allMatches.find(m => {
          const mid = (m as any)._id.toString();
          if (claimedIds.has(mid)) return false;
          const mp1 = (m.player1Id as any)._id.toString();
          const mp2 = (m.player2Id as any)._id.toString();
          return (
            new Date(m.date) >= wm.createdAt &&
            ((mp1 === p1id && mp2 === p2id) || (mp1 === p2id && mp2 === p1id))
          );
        });

        if (recorded) claimedIds.add((recorded as any)._id.toString());

        const formatted = formatDoc(wm);
        const fp1 = formatted.player1Id as any;
        const fp2 = formatted.player2Id as any;
        if (fp1?._id) { fp1.id = fp1._id.toString(); delete fp1._id; }
        if (fp2?._id) { fp2.id = fp2._id.toString(); delete fp2._id; }
        formatted.isCompleted = !!recorded;
        if (recorded) {
          const rp1 = recorded.player1Id as any;
          const rp2 = recorded.player2Id as any;
          formatted.completedMatch = {
            score1: recorded.score1,
            score2: recorded.score2,
            player1Id: { id: (rp1._id ?? rp1.id).toString(), firstName: rp1.firstName, lastName: rp1.lastName },
            player2Id: { id: (rp2._id ?? rp2.id).toString(), firstName: rp2.firstName, lastName: rp2.lastName },
          };
        } else {
          formatted.completedMatch = null;
        }
        return formatted;
      });
    })();

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

// Seed Week 1 players + fixtures (idempotent — skips existing players)
app.post('/api/admin/seed-week1', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const PLAYERS = [
      { firstName: 'Haseeb',  lastName: 'Ahmad' },
      { firstName: 'Sabih',   lastName: 'Mankani' },
      { firstName: 'Usman',   lastName: 'Danish' },
      { firstName: 'Meran',   lastName: 'Eshaq' },
      { firstName: 'Talha',   lastName: 'Ahmad' },
      { firstName: 'Shauzab', lastName: 'Hasan' },
      { firstName: 'Waleed',  lastName: 'Ahmad' },
      { firstName: 'Umair',   lastName: 'Malik' },
      { firstName: 'Naveed',  lastName: 'Ahmad' },
    ];
    const WEEK_LABEL = 'Week 1 — May 5–10, 2026';

    // Upsert players
    const idMap: Record<string, string> = {};
    for (const p of PLAYERS) {
      let player = await Player.findOne({ firstName: p.firstName });
      if (!player) {
        player = await Player.create(p);
      }
      idMap[p.firstName.toLowerCase()] = player._id.toString();
    }

    // Rebuild weekly schedule
    await WeeklyMatch.deleteMany({});
    const FIXTURES: [string, string][] = [
      ['haseeb', 'sabih'],   ['sabih', 'usman'],
      ['meran', 'talha'],    ['shauzab', 'waleed'],
      ['umair', 'naveed'],   ['usman', 'haseeb'],
      ['talha', 'shauzab'],  ['waleed', 'umair'],
      ['naveed', 'meran'],
    ];
    for (const [h, a] of FIXTURES) {
      await WeeklyMatch.create({ player1Id: idMap[h], player2Id: idMap[a], weekLabel: WEEK_LABEL });
    }

    res.json({ message: 'Seeded 9 players and 9 Week 1 fixtures.', players: Object.keys(idMap) });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// Seed Week 2 fixtures (keeps Week 1 and all players, only replaces Week 2 fixtures)
app.post('/api/admin/seed-week2', async (req: AuthRequest, res) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const WEEK_LABEL = 'Week 2 — May 12–17, 2026';

    const players = await Player.find();
    const idMap: Record<string, string> = {};
    for (const p of players) idMap[p.firstName.toLowerCase()] = p._id.toString();

    const FIXTURES: [string, string][] = [
      ['meran',   'usman'],
      ['talha',   'sabih'],
      ['shauzab', 'haseeb'],
      ['umair',   'meran'],
      ['naveed',  'sabih'],
      ['haseeb',  'talha'],
      ['sabih',   'shauzab'],
      ['meran',   'umair'],
      ['talha',   'naveed'],
    ];

    await WeeklyMatch.deleteMany({ weekLabel: WEEK_LABEL });
    for (const [h, a] of FIXTURES) {
      if (!idMap[h] || !idMap[a]) continue;
      await WeeklyMatch.create({ player1Id: idMap[h], player2Id: idMap[a], weekLabel: WEEK_LABEL });
    }

    res.json({ message: 'Seeded 9 Week 2 fixtures.' });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
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
