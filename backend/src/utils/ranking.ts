import { readJsonFile } from '../index'; // Assuming readJsonFile is exported from index.ts
import path from 'path';

const dataDir = path.join(__dirname, '../../data');
const playersFilePath = path.join(dataDir, 'players.json');
const matchesFilePath = path.join(dataDir, 'matches.json');

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  ranking: number;
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
  groupId?: string; // Added for consistency, though not directly used in ranking logic here
}

interface PlayerRanking {
  player: Player;
  wins: number;
  losses: number;
  winLossRatio: number;
  setsWon: number; // New stat
  setsLost: number; // New stat
  setsRatio: number; // New stat
}

export const calculateOverallRanking = (): PlayerRanking[] => {
  const players = readJsonFile<Player>(playersFilePath);
  const matches = readJsonFile<Match>(matchesFilePath);

  const playerStats: { [key: string]: { wins: number; losses: number; setsWon: number; setsLost: number } } = {};

  players.forEach(player => {
    playerStats[player.id] = { wins: 0, losses: 0, setsWon: 0, setsLost: 0 };
  });

  matches.forEach(match => {
    // Update match wins/losses
    if (match.score1 > match.score2) {
      playerStats[match.player1Id].wins++;
      playerStats[match.player2Id].losses++;
    } else if (match.score2 > match.score1) {
      playerStats[match.player2Id].wins++;
      playerStats[match.player1Id].losses++;
    }

    // Update sets won/lost
    playerStats[match.player1Id].setsWon += match.score1;
    playerStats[match.player1Id].setsLost += match.score2;
    playerStats[match.player2Id].setsWon += match.score2;
    playerStats[match.player2Id].setsLost += match.score1;
  });

  const rankings: PlayerRanking[] = players.map(player => {
    const stats = playerStats[player.id];
    const totalMatches = stats.wins + stats.losses;
    const winLossRatio = totalMatches > 0 ? stats.wins / totalMatches : 0;
    const totalSets = stats.setsWon + stats.setsLost;
    const setsRatio = totalSets > 0 ? stats.setsWon / totalSets : 0; // Calculate sets ratio

    return {
      player,
      wins: stats.wins,
      losses: stats.losses,
      winLossRatio,
      setsWon: stats.setsWon,
      setsLost: stats.setsLost,
      setsRatio,
    };
  });

  // Sort by wins (descending), then by setsRatio (descending)
  return rankings.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.setsRatio - a.setsRatio;
  });
};

export const calculateTournamentRanking = (tournamentId: string, groupId?: string): PlayerRanking[] => {
  const players = readJsonFile<Player>(playersFilePath);
  const matches = readJsonFile<Match>(matchesFilePath);

  let tournamentMatches = matches.filter(match => match.tournamentId === tournamentId);

  // If a groupId is provided, filter matches by that group
  if (groupId) {
    tournamentMatches = tournamentMatches.filter(match => match.groupId === groupId);
  }

  const playerStats: { [key: string]: { wins: number; losses: number; setsWon: number; setsLost: number } } = {};

  // Initialize stats for players who played in this tournament
  const playersInTournament = new Set<string>();
  tournamentMatches.forEach(match => {
    playersInTournament.add(match.player1Id);
    playersInTournament.add(match.player2Id);
  });

  playersInTournament.forEach(playerId => {
    playerStats[playerId] = { wins: 0, losses: 0, setsWon: 0, setsLost: 0 };
  });

  tournamentMatches.forEach(match => {
    // Update match wins/losses
    if (match.score1 > match.score2) {
      playerStats[match.player1Id].wins++;
      playerStats[match.player2Id].losses++;
    } else if (match.score2 > match.score1) {
      playerStats[match.player2Id].wins++;
      playerStats[match.player1Id].losses++;
    }

    // Update sets won/lost
    playerStats[match.player1Id].setsWon += match.score1;
    playerStats[match.player1Id].setsLost += match.score2;
    playerStats[match.player2Id].setsWon += match.score2;
    playerStats[match.player2Id].setsLost += match.score1;
  });

  const rankings: PlayerRanking[] = Array.from(playersInTournament).map(playerId => {
    const player = players.find(p => p.id === playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found.`);
    }
    const stats = playerStats[playerId];
    const totalMatches = stats.wins + stats.losses;
    const winLossRatio = totalMatches > 0 ? stats.wins / totalMatches : 0;
    const totalSets = stats.setsWon + stats.setsLost;
    const setsRatio = totalSets > 0 ? stats.setsWon / totalSets : 0; // Calculate sets ratio

    return {
      player,
      wins: stats.wins,
      losses: stats.losses,
      winLossRatio,
      setsWon: stats.setsWon,
      setsLost: stats.setsLost,
      setsRatio,
    };
  });

  // Sort by wins (descending), then by setsRatio (descending)
  return rankings.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.setsRatio - a.setsRatio;
  });
};