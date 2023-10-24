export interface NodeData {
  floor: number;
  survey_node: SurveyNode;
  minimap_node: MinimapNode;
  x: number;
  y: number;
}

export interface SurveyNode {
  tiles_id: string;
  tiles_name: string;
  levels: Level[];
  face_size: number;
  survey_name: string;
  initial_parameters: InitialViewParameters;
  link_hotspots: LinkHotspot[];
  info_hotspots: InfoHotspot[];
  manta_link: string;
}

export interface MinimapNode {
  id: string;
  node_number: 0;
  tiles_id: string;
  floor_id: string;
  floor: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  survey_node: any;
}

export interface MarziSettings {
  mouseViewMode: string;
  autorotateEnabled: boolean;
  fullscreenButton: boolean;
  viewControlButtons: boolean;
}

export interface Level {
  tileSize: number;
  size: number;
  fallbackOnly?: boolean;
}

export interface InitialViewParameters {
  yaw: number;
  pitch: number;
  fov: number;
}

export interface LinkHotspot {
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
}

export interface InfoHotspot {
  yaw: number;
  pitch: number;
  title: string;
  id: number;
  info_id: string;
}
