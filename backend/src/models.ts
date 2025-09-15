import { Schema, model, Document } from 'mongoose';

// Player Model
export interface IPlayer extends Document {
  firstName: string;
  lastName: string;
  location: string;
  ranking: number;
}
const PlayerSchema = new Schema<IPlayer>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  location: { type: String, required: true },
  ranking: { type: Number, required: true },
});
export const Player = model<IPlayer>('Player', PlayerSchema);

// Group Model
export interface IGroup extends Document {
  name: string;
  playerIds: Schema.Types.ObjectId[]; // References Player documents
}
const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  playerIds: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
});
export const Group = model<IGroup>('Group', GroupSchema);

// Tournament Model
export interface ITournament extends Document {
  name: string;
  groupIds: Schema.Types.ObjectId[]; // References Group documents
  isGroupBased: boolean;
}
const TournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  isGroupBased: { type: Boolean, default: false },
});
export const Tournament = model<ITournament>('Tournament', TournamentSchema);

// Match Model
export interface IMatch extends Document {
  tournamentId: Schema.Types.ObjectId; // References Tournament document
  player1Id: Schema.Types.ObjectId;    // References Player document
  player2Id: Schema.Types.ObjectId;    // References Player document
  score1: number;
  score2: number;
  location: string;
  date: Date; // Stored as a Date object
  groupId?: Schema.Types.ObjectId;     // References Group document (optional)
}
const MatchSchema = new Schema<IMatch>({
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  player1Id: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  player2Id: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  score1: { type: Number, required: true },
  score2: { type: Number, required: true },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: false },
});
export const Match = model<IMatch>('Match', MatchSchema);
