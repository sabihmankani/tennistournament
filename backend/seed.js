/**
 * Seed script: adds 9 players + Week 1 fixtures via the live API.
 * Usage: ADMIN_TOKEN=<token> node seed.js
 *    or: node seed.js  (will login automatically)
 *
 * Set API_BASE to your deployed backend URL if needed.
 */

const https = require('https');
const http = require('http');

const API_BASE = process.env.API_BASE || 'https://tennistournament-7ixe.vercel.app/api';

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

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const lib = url.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, data: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 1. Login
  console.log('Logging in…');
  const loginRes = await request('POST', '/admin/login', { username: 'admin', password: 'UsmanisKing' });
  if (!loginRes.data.token) {
    console.error('Login failed:', loginRes.data);
    process.exit(1);
  }
  const token = loginRes.data.token;
  console.log('✓ Logged in');

  // 2. Get existing players
  const existingRes = await request('GET', '/players', null, token);
  const existing = existingRes.data || [];
  console.log(`\nExisting players (${existing.length}):`, existing.map(p => `${p.firstName} ${p.lastName}`).join(', ') || 'none');

  // 3. Add missing players
  const playerIds = {};
  for (const p of existing) {
    playerIds[p.firstName.toLowerCase()] = p.id;
  }

  console.log('\nAdding missing players…');
  for (const p of PLAYERS) {
    const key = p.firstName.toLowerCase();
    if (playerIds[key]) {
      console.log(`  - ${p.firstName} ${p.lastName}: already exists (${playerIds[key]})`);
    } else {
      const res = await request('POST', '/players', p, token);
      if (res.status === 201) {
        playerIds[key] = res.data.id;
        console.log(`  + ${p.firstName} ${p.lastName}: added (${res.data.id})`);
      } else {
        console.error(`  ! Failed to add ${p.firstName}:`, res.data);
      }
    }
  }

  // 4. Clear existing weekly schedule
  console.log('\nClearing existing weekly schedule…');
  await request('DELETE', '/admin/weekly-matches', null, token);
  console.log('✓ Cleared');

  // 5. Add Week 1 fixtures
  const FIXTURES = [
    ['haseeb',  'sabih'],
    ['sabih',   'usman'],
    ['meran',   'talha'],
    ['shauzab', 'waleed'],
    ['umair',   'naveed'],
    ['usman',   'haseeb'],
    ['talha',   'shauzab'],
    ['waleed',  'umair'],
    ['naveed',  'meran'],
  ];

  console.log('\nAdding Week 1 fixtures…');
  for (const [home, away] of FIXTURES) {
    const p1 = playerIds[home];
    const p2 = playerIds[away];
    if (!p1 || !p2) {
      console.error(`  ! Missing ID for ${home} or ${away}`);
      continue;
    }
    const res = await request('POST', '/admin/weekly-matches', {
      player1Id: p1, player2Id: p2, weekLabel: WEEK_LABEL,
    }, token);
    if (res.status === 201) {
      const h = PLAYERS.find(p => p.firstName.toLowerCase() === home);
      const a = PLAYERS.find(p => p.firstName.toLowerCase() === away);
      console.log(`  + ${h?.firstName} vs ${a?.firstName}`);
    } else {
      console.error(`  ! Failed:`, res.data);
    }
  }

  console.log('\n✅ Seed complete! Week 1 fixtures are live.');
}

main().catch(e => { console.error(e); process.exit(1); });
