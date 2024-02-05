export type TagOrNameIdentifier = "tag" | "name";

/**
 * Configuration / settings to be used for the floor tag and name input elements.
 */
export interface FloorTagOrNameInputConfig {
  label: string;
  value: string;
  tagOrName: TagOrNameIdentifier;
  setter: React.Dispatch<React.SetStateAction<string>>;
  id: string;
  cy: string;
  otherValue: string;
}
