export interface IUser {
  _id: string;
  username: string;
  role: UserRoles;
  isAdmin?: boolean;
}

export enum UserRoles {
  SUPERADMIN = "superAdmin",
  PROJECTADMIN = "projectAdmin",
  GUEST = "guest",
}
