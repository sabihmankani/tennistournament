import { Schema, model, Document, Types } from 'mongoose';

export interface IPlayer extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}
const PlayerSchema = new Schema<IPlayer>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});
export const Player = model<IPlayer>('Player', PlayerSchema);

export interface IMatch extends Document {
  _id: Types.ObjectId;
  player1Id: Types.ObjectId;
  player2Id: Types.ObjectId;
  score1: number;
  score2: number;
  date: Date;
  ipAddress?: string;
}
const MatchSchema = new Schema<IMatch>({
  player1Id: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  player2Id: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  score1: { type: Number, required: true },
  score2: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  ipAddress: { type: String },
});
export const Match = model<IMatch>('Match', MatchSchema);

export interface IRateLimit extends Document {
  identifier: string;
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
