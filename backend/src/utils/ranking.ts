import { Player, Match, IPlayer, IMatch } from '../models';
import mongoose from 'mongoose';

interface PlayerRanking {
  player: IPlayer; // Use Mongoose Player interface
  wins: number;
  losses: number;
  winLossRatio: number;
  gamesWon: number;
  gamesLost: number;
  gamesRatio: number;
}

export const calculateOverallRanking = async (): Promise<PlayerRanking[]> => {
  const players = await Player.find();
  const matches = await Match.find();

  const playerStats: { [key: string]: { wins: number; losses: number; gamesWon: number; gamesLost: number } } = {};

  players.forEach(player => {
    playerStats[player._id.toString()] = { wins: 0, losses: 0, gamesWon: 0, gamesLost: 0 };
  });

  matches.forEach(match => {
    const player1Id = match.player1Id.toString();
    const player2Id = match.player2Id.toString();

    if (!playerStats[player1Id] || !playerStats[player2Id]) {
      // Handle cases where player might not exist (e.g., deleted player)
      return;
    }

    // Update match wins/losses
    if (match.score1 > match.score2) {
      playerStats[player1Id].wins++;
      playerStats[player2Id].losses++;
    } else if (match.score2 > match.score1) {
      playerStats[player2Id].wins++;
      playerStats[player1Id].losses++;
    }

    // Update games won/lost
    playerStats[player1Id].gamesWon += match.score1;
    playerStats[player1Id].gamesLost += match.score2;
    playerStats[player2Id].gamesWon += match.score2;
    playerStats[player2Id].gamesLost += match.score1;
  });

  const rankings: PlayerRanking[] = players.map(player => {
    const stats = playerStats[player._id.toString()];
    const totalMatches = stats.wins + stats.losses;
    const winLossRatio = totalMatches > 0 ? stats.wins / totalMatches : 0;
    const totalGames = stats.gamesWon + stats.gamesLost;
    const gamesRatio = totalGames > 0 ? stats.gamesWon / totalGames : 0;

    return {
      player,
      wins: stats.wins,
      losses: stats.losses,
      winLossRatio,
      gamesWon: stats.gamesWon,
      gamesLost: stats.gamesLost,
      gamesRatio,
    };
  });

  // Sort by wins (descending), then by gamesRatio (descending)
  return rankings.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.gamesRatio - a.gamesRatio;
  });
};

export const calculateTournamentRanking = async (tournamentId: string, groupId?: string): Promise<PlayerRanking[]> => {
  const players = await Player.find();
  let query: any = { tournamentId: new mongoose.Types.ObjectId(tournamentId) };
  if (groupId) {
    query.groupId = new mongoose.Types.ObjectId(groupId);
  }
  const tournamentMatches = await Match.find(query);

  const playerStats: { [key: string]: { wins: number; losses: number; gamesWon: number; gamesLost: number } } = {};

  // Initialize stats for players who played in this tournament
  const playersInTournament = new Set<string>();
  tournamentMatches.forEach(match => {
    playersInTournament.add(match.player1Id.toString());
    playersInTournament.add(match.player2Id.toString());
  });

  playersInTournament.forEach(playerId => {
    playerStats[playerId] = { wins: 0, losses: 0, gamesWon: 0, gamesLost: 0 };
  });

  tournamentMatches.forEach(match => {
    const player1Id = match.player1Id.toString();
    const player2Id = match.player2Id.toString();

    if (!playerStats[player1Id] || !playerStats[player2Id]) {
      // Handle cases where player might not exist (e.g., deleted player)
      return;
    }

    // Update match wins/losses
    if (match.score1 > match.score2) {
      playerStats[player1Id].wins++;
      playerStats[player2Id].losses++;
    } else if (match.score2 > match.score1) {
      playerStats[player2Id].wins++;
      playerStats[player1Id].losses++;
    }

    // Update games won/lost
    playerStats[player1Id].gamesWon += match.score1;
    playerStats[player1Id].gamesLost += match.score2;
    playerStats[player2Id].gamesWon += match.score2;
    playerStats[player2Id].gamesLost += match.score1;
  });

  const rankings: PlayerRanking[] = Array.from(playersInTournament).map(playerId => {
    const player = players.find(p => p._id.toString() === playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found.`);
    }
    const stats = playerStats[playerId];
    const totalMatches = stats.wins + stats.losses;
    const winLossRatio = totalMatches > 0 ? stats.wins / totalMatches : 0;
    const totalGames = stats.gamesWon + stats.gamesLost;
    const gamesRatio = totalGames > 0 ? stats.gamesWon / totalGames : 0;

    return {
      player,
      wins: stats.wins,
      losses: stats.losses,
      winLossRatio,
      gamesWon: stats.gamesWon,
      gamesLost: stats.gamesLost,
      gamesRatio,
    };
  });

  // Sort by wins (descending), then by gamesRatio (descending)
  return rankings.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.gamesRatio - a.gamesRatio;
  });
};