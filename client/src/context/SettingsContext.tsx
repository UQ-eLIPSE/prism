import React, { createContext, useContext, useState } from "react";
import { ISettings } from "../interfaces/Settings";

export type SettingsContextType = [
  ISettings | null,
  (settings: ISettings | null) => void,
];

export const SettingsContext = createContext<SettingsContextType>([
  null,
  () => {
    return;
  },
]);

export const useSettingsContext = () => useContext(SettingsContext);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SettingsContextProvider: React.FC<any> = (props) => {
  const [sessionState, setSessionState] = useState<ISettings | null>(null);

  return (
    <SettingsContext.Provider
      value={[
        sessionState,
        (settings: ISettings | null) => setSessionState(settings),
      ]}
    >
      {props.children}
    </SettingsContext.Provider>
  );
};
