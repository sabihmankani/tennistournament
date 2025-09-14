import React, { useEffect, useState } from 'react';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface PlayerRanking {
  player: Player;
  wins: number;
  losses: number;
  winLossRatio: number;
  setsWon: number;
  setsLost: number;
  setsRatio: number;
}

interface Tournament {
  id: string;
  name: string;
  isGroupBased: boolean;
  groupIds: string[];
}

interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

const RankingsPage: React.FC = () => {
  const [overallRankings, setOverallRankings] = useState<PlayerRanking[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [groups, setGroups] = useState<Group[]>([]); // New state for groups
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [tournamentRankings, setTournamentRankings] = useState<PlayerRanking[]>([]);
  const [groupRankings, setGroupRankings] = useState<{ [key: string]: PlayerRanking[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch overall rankings
        const overallResponse = await fetch('http://localhost:3001/api/rankings/overall');
        if (!overallResponse.ok) {
          throw new Error(`HTTP error! status: ${overallResponse.status}`);
        }
        const overallData: PlayerRanking[] = await overallResponse.json();
        setOverallRankings(overallData);

        // Fetch tournaments for dropdown
        const tournamentsResponse = await fetch('http://localhost:3001/api/tournaments');
        if (!tournamentsResponse.ok) {
          throw new Error(`HTTP error! status: ${tournamentsResponse.status}`);
        }
        const tournamentsData: Tournament[] = await tournamentsResponse.json();
        setTournaments(tournamentsData);

        // Fetch groups
        const groupsResponse = await fetch('http://localhost:3001/api/groups');
        if (!groupsResponse.ok) {
          throw new Error(`HTTP error! status: ${groupsResponse.status}`);
        }
        const groupsData: Group[] = await groupsResponse.json();
        setGroups(groupsData);

      } catch (error) {
        console.error("Error fetching data for RankingsPage:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTournamentRankings = async () => {
      if (selectedTournament) {
        const tournament = tournaments.find(t => t.id === selectedTournament);
        if (tournament?.isGroupBased) {
          // Fetch rankings for each group
          const groupRankingsData: { [key: string]: PlayerRanking[] } = {};
          for (const groupId of tournament.groupIds) {
            try {
              const response = await fetch(`http://localhost:3001/api/rankings/tournament/${selectedTournament}/group/${groupId}`);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data: PlayerRanking[] = await response.json();
              groupRankingsData[groupId] = data;
            } catch (error) {
              console.error(`Error fetching group rankings for group ${groupId}:`, error);
            }
          }
          setGroupRankings(groupRankingsData);
          setTournamentRankings([]); // Clear the old tournament-wide rankings
        } else {
          // Fetch non-group-based rankings
          try {
            const response = await fetch(`http://localhost:3001/api/rankings/tournament/${selectedTournament}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: PlayerRanking[] = await response.json();
            setTournamentRankings(data);
            setGroupRankings({}); // Clear group rankings
          } catch (error) {
            console.error("Error fetching tournament rankings:", error);
          }
        }
      } else {
        setTournamentRankings([]);
        setGroupRankings({});
      }
    };
    fetchTournamentRankings();
  }, [selectedTournament, tournaments]);

  const selectedTournamentDetails = tournaments.find(t => t.id === selectedTournament);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Player Rankings</h2>

      <div className="row">
        <div className="col-md-6">
          <h3>Overall Rankings</h3>
          {overallRankings.length === 0 ? (
            <p>No overall rankings available yet.</p>
          ) : (
            <ul className="list-group">
              {overallRankings.map((ranking: PlayerRanking, index: number) => (
                <li key={ranking.player.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>{index + 1}. {ranking.player.firstName} {ranking.player.lastName}</strong>
                  <span>
                    Wins: {ranking.wins}, Losses: {ranking.losses} (Ratio: {ranking.winLossRatio.toFixed(2)})
                    <br />
                    Sets Won: {ranking.setsWon}, Sets Lost: {ranking.setsLost} (Ratio: {ranking.setsRatio.toFixed(2)})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-md-6">
          <h3>Tournament Rankings</h3>
          <div className="mb-3">
            <label htmlFor="tournamentSelect" className="form-label">Select Tournament</label>
            <select
              className="form-select"
              id="tournamentSelect"
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
            >
              <option value="">-- Select a Tournament --</option>
              {tournaments.map((tournament: Tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} {tournament.isGroupBased ? '(Group Based)' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedTournament && selectedTournamentDetails?.isGroupBased ? (
            // Display group-based rankings
            <div>
              {selectedTournamentDetails.groupIds.map((groupId: string) => {
                const group = groups.find((g: Group) => g.id === groupId);
                const rankings = groupRankings[groupId] || [];

                return (
                  <div key={groupId} className="mb-4">
                    <h4>{group?.name || 'Unknown Group'} Rankings</h4>
                    {rankings.length === 0 ? (
                      <p>No rankings for this group yet.</p>
                    ) : (
                      <ul className="list-group">
                        {rankings.map((ranking: PlayerRanking, index: number) => (
                          <li key={ranking.player.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{index + 1}. {ranking.player.firstName} {ranking.player.lastName}</strong>
                            <span>
                              Wins: {ranking.wins}, Losses: {ranking.losses} (Ratio: {ranking.winLossRatio.toFixed(2)})<br />
                              Sets Won: {ranking.setsWon}, Sets Lost: {ranking.setsLost} (Ratio: {ranking.setsRatio.toFixed(2)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : selectedTournament && tournamentRankings.length > 0 ? (
            // Display non-group-based rankings
            <ul className="list-group">
              {tournamentRankings.map((ranking: PlayerRanking, index: number) => (
                <li key={ranking.player.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>{index + 1}. {ranking.player.firstName} {ranking.player.lastName}</strong>
                  <span>
                    Wins: {ranking.wins}, Losses: {ranking.losses} (Ratio: {ranking.winLossRatio.toFixed(2)})<br />
                    Sets Won: {ranking.setsWon}, Sets Lost: {ranking.setsLost} (Ratio: {ranking.setsRatio.toFixed(2)})
                  </span>
                </li>
              ))}
            </ul>
          ) : selectedTournament ? (
            <p>No rankings available for this tournament yet.</p>
          ) : (
            <p>Select a tournament to view its rankings.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;