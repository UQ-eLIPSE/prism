import { Schema, Document, Model, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  role: string;
  email?: string;
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
  username: { type: String, unique: true },
  email: { type: String },
  password: { type: String },
  role: {
    type: String,
    required: true,
    enum: ["superAdmin", "projectAdmin", "guest"],
    default: "guest",
  },
});

const InvitedUserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ["superAdmin", "projectAdmin", "guest"],
    default: "guest",
  },
});

export const User: Model<IUser> = model<IUser>("users", UserSchema);

export const InvitedUser: Model<IUser> = model<IUser>(
  "InvitedUser",
  InvitedUserSchema,
);
