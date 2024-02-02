import { InfoHotspot } from "../NodeData";

export interface NewNode {
  floor: number;
  node_number: number;
  site: string;
  survey_node: string;
  tiles_id: string;
  tiles_name: string;
  x: number;
  x_scale: number;
  y: number;
  y_scale: number;
  rotation: number;
  minimapShown?: boolean;
  info_hotspots: InfoHotspot[] | [];
}
