import { Player, Match, IPlayer } from '../models';

export interface PlayerRanking {
  player: IPlayer;
  wins: number;
  losses: number;
  winPct: number;
  gamesWon: number;
  gamesLost: number;
  gamesRatio: number;
  matchesPlayed: number;
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
    const played = s.wins + s.losses;
    const totalGames = s.gamesWon + s.gamesLost;
    return {
      player,
      wins: s.wins,
      losses: s.losses,
      winPct: played > 0 ? s.wins / played : 0,
      gamesWon: s.gamesWon,
      gamesLost: s.gamesLost,
      gamesRatio: totalGames > 0 ? s.gamesWon / totalGames : 0,
      matchesPlayed: played,
    };
  });

  return rankings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.gamesRatio - a.gamesRatio;
  });
};
