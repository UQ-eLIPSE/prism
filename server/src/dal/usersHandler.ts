import { IUser, User } from "../models/UserModel";

export const usersFindOne = async (
  data: Partial<IUser>,
): Promise<IUser | null> => {
  return User.findOne({
    data,
  });
};
