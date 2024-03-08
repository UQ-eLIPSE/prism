import { IUser, User } from "../models/UserModel";

const findOne = async (data: Partial<IUser>): Promise<IUser | null> => {
  return User.findOne({
    data,
  });
};
export { findOne };
