import { Schema, Document, Model, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  password?: string;
}

export interface IUserList extends Document {
  currentPage: number;
  nextPage: number;
  totalPages: number;
  pageSize: number;
  users: IUser[];
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, unique: true },
  password: { type: String },
  role: {
    type: String,
    required: true,
    enum: ['superAdmin', 'projectAdmin', 'guest'],
  },
});

const InvitedUserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ['superAdmin', 'projectAdmin', 'guest'],
  },
});

export const User: Model<IUser> = model<IUser>('User', UserSchema);
export const InvitedUser: Model<IUser> = model<IUser>(
  'InvitedUser',
  InvitedUserSchema,
);
