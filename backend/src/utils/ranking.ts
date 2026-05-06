import { Player, Match, IPlayer } from '../models';

export interface PlayerRanking {
  player: IPlayer;
  points: number;       // wins × 3
  wins: number;
  losses: number;
  matchesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gameDiff: number;     // gamesWon - gamesLost
}

export const calculateOverallRanking = async (): Promise<PlayerRanking[]> => {
  const players = await Player.find();
  const matches = await Match.find();

  const stats: Record<string, { wins: number; losses: number; gamesWon: number; gamesLost: number }> = {};
  players.forEach(p => {
    stats[p._id.toString()] = { wins: 0, losses: 0, gamesWon: 0, gamesLost: 0 };
  });

  matches.forEach(match => {
    const p1 = match.player1Id.toString();
    const p2 = match.player2Id.toString();
    if (!stats[p1] || !stats[p2]) return;

    if (match.score1 > match.score2) {
      stats[p1].wins++;
      stats[p2].losses++;
    } else {
      stats[p2].wins++;
      stats[p1].losses++;
    }
    stats[p1].gamesWon += match.score1;
    stats[p1].gamesLost += match.score2;
    stats[p2].gamesWon += match.score2;
    stats[p2].gamesLost += match.score1;
  });

  const rankings: PlayerRanking[] = players.map(player => {
    const s = stats[player._id.toString()];
    return {
      player,
      points: s.wins * 3,
      wins: s.wins,
      losses: s.losses,
      matchesPlayed: s.wins + s.losses,
      gamesWon: s.gamesWon,
      gamesLost: s.gamesLost,
      gameDiff: s.gamesWon - s.gamesLost,
    };
  });

  // Sort: 1) points DESC  2) gameDiff DESC  3) gamesWon DESC
  return rankings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
    return b.gamesWon - a.gamesWon;
  });
};
