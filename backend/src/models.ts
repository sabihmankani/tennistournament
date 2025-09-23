import { Schema, model, Document, Types } from 'mongoose';

// Player Model
export interface IPlayer extends Document {
  _id: Types.ObjectId;
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
  _id: Types.ObjectId;
  name: string;
  playerIds: Types.ObjectId[]; // References Player documents
}
const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  playerIds: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
});
export const Group = model<IGroup>('Group', GroupSchema);

// Tournament Model
export interface ITournament extends Document {
  _id: Types.ObjectId;
  name: string;
  groupIds: Types.ObjectId[]; // References Group documents
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
  _id: Types.ObjectId;
  tournamentId: Types.ObjectId; // References Tournament document
  player1Id: Types.ObjectId;    // References Player document
  player2Id: Types.ObjectId;    // References Player document
  score1: number;
  score2: number;
  location: string;
  date: Date; // Stored as a Date object
  groupId?: Types.ObjectId;     // References Group document (optional)
  ipAddress?: string;
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
  ipAddress: { type: String },
});
export const Match = model<IMatch>('Match', MatchSchema);

// Rate Limit Model
export interface IRateLimit extends Document {
  identifier: string; // IP address
  lastMatchTimestamp: Date;
  dailyMatchCount: number;
  dailyCountTimestamp: Date;
  blockedUntil?: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  identifier: { type: String, required: true, unique: true },
  lastMatchTimestamp: { type: Date, required: true },
  dailyMatchCount: { type: Number, default: 0 },
  dailyCountTimestamp: { type: Date, required: true },
  blockedUntil: { type: Date },
});

export const RateLimit = model<IRateLimit>('RateLimit', RateLimitSchema);
