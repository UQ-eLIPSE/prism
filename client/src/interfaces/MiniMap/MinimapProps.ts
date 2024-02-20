import { MinimapReturn } from "../../components/Site";
import { ISettings } from "../../typings/settings";
import { NodeConfiguration, NodeData } from "../NodeData";

export interface MinimapProps {
  currPanoId: string;
  onClickNode: (panoId: string) => void;
  currRotation: number;
  minimapEnlarged: boolean;
  updateMinimapEnlarged: (minimapEnlarged: boolean) => void;
  nodeData: NodeData[];
  sideNavOpened: boolean;
  config: ISettings;
  linkNodeFunction: (state: boolean) => void;
  timelineOpen: boolean;
  closeTimelineFunction: (open: boolean) => void;
  minimapData: MinimapReturn;
  floor: number;
  siteId: string;
  getMinimapImage: (floor: number) => Promise<void>;
  updateFloorTag: (input: string) => void;
  minimapShown: boolean;
  currDate: Date;
  setNodeState: (nodeState: NodeConfiguration) => void;
}
