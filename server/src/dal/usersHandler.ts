import { IUser, User } from "../models/UserModel";
import { FilterQuery } from "mongoose";
const findOne = async (data: FilterQuery<IUser>): Promise<IUser | null> => {
  return User.findOne(data);
};
export default { findOne };
