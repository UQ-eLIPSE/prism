import React, { createContext, useContext, useState } from "react";
import { IUser } from "../interfaces/User";

export type UserContextType = [IUser | null, (user: IUser | null) => void];

export const UserContext = createContext<UserContextType>([
  null,
  () => {
    return;
  },
]);

export const useUserContext = () => useContext(UserContext);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserContextProvider: React.FC<any> = (props) => {
  const [sessionState, setSessionState] = useState<IUser | null>(null);

  return (
    <UserContext.Provider
      value={[sessionState, (user: IUser | null) => setSessionState(user)]}
    >
      {props.children}
    </UserContext.Provider>
  );
};
