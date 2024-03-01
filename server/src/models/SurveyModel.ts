import { Schema, Document, Model, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IMinimapConversion extends Document {
  floor: number;
  x: number;
  y: number;
  x_scale: number;
  y_scale: number;
  survey_node: ISurveyNode & Schema.Types.ObjectId;
  minimap_node: IMinimapNode & Schema.Types.ObjectId;
  site: number & Schema.Types.ObjectId;
  rotation: number;
}

export interface IMinimapNode extends Document {
  node_number: number;
  title: string;
  description: string;
  survey_node: ISurveyNode;
  floor: number;
  site: number;
}

export interface IInitialParams extends Document {
  pitch: number;
  yaw: number;
  fov: number;
}

export interface IInfoHotspot extends Document {
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
  info_id: string;
}

export interface ILinkHotspot extends Document {
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
}

export interface ISurveyNode extends Document {
  // uploaded_at: string;
  // uploaded_by: string;
  date: string;
  manta_link: string;
  node_number: number;
  survey_name: string;
  tiles_id: string;
  tiles_name: string;
  initial_parameters: IInitialParams;
  link_hotspots: ILinkHotspot[];
  info_hotspots: IInfoHotspot[];
  levels: number[]; // Cannot be mapped because of how Marzipano export the data for levels,
  face_size: number;
  site: number;
}

export interface ISurvey extends Document {
  survey_name: string;
  survey_nodes: ISurveyNode[];
}

export interface IHeaderInfo extends Document {
  main_img_url: string;
  label_title: string;
}

export interface IContentSection extends Document {
  title: string;
  content: string;
}

export interface IHotspotDescription extends Document {
  header: IHeaderInfo;
  contents: IContentSection[];
  tiles_id: string;
  info_id: string;
}

export interface IMinimapImages extends Document {
  floor: number;
  floor_name: string;
  floor_tag: string;
  image_url: string;
  image_large_url: string;
  x_pixel_offset: number;
  y_pixel_offset: number;
  x_scale: number;
  y_scale: number;
  img_width: number;
  img_height: number;
  xy_flipped: boolean;
}

const SurveySchema: Schema = new Schema({
  survey_name: { type: String },
  survey_nodes: [{ type: Schema.Types.Mixed, ref: "survey_nodes" }],
});

const SurveyNodeSchema: Schema = new Schema({
  survey_name: { type: String },
  uploaded_at: { type: Date },
  uploaded_by: { type: String, ref: "User" },
  manta_link: { type: String },
  date: { type: Date },
  node_number: { type: Number },
  tiles_id: { type: String },
  tiles_name: { type: String },
  initial_parameters: { type: Schema.Types.Mixed },
  link_hotspots: [Schema.Types.Mixed],
  info_hotspots: [Schema.Types.Mixed],
  levels: [Schema.Types.Mixed],
  face_size: { type: Number },
  site: { type: Schema.Types.ObjectId, ref: "sites" },
});

const MinimapNodeSchema: Schema = new Schema({
  node_number: { type: Number },
  tiles_id: { type: String },
  tiles_name: { type: String },
  survey_node: { type: Schema.Types.Mixed, ref: "survey_nodes" },
  floor: { type: Number },
  site: { type: Schema.Types.ObjectId, ref: "sites" },
});

const MinimapConversionSchema: Schema = new Schema({
  floor: { type: Number },
  x: { type: Number },
  y: { type: Number },
  x_scale: { type: Number },
  y_scale: { type: Number },
  survey_node: { type: Schema.Types.Mixed, ref: "survey_nodes" },
  minimap_node: { type: Schema.Types.Mixed, ref: "minimap_nodes" },
  site: { type: Schema.Types.ObjectId, ref: "sites" },
  rotation: { type: Number },
});

const HotspotDescriptionSchema: Schema = new Schema({
  header: { type: Schema.Types.Mixed },
  contents: [Schema.Types.Mixed],
  tiles_id: { type: String, ref: "survey_node" },
  info_id: { type: String, default: uuidv4 },
});

const MinimapImagesSchema: Schema = new Schema({
  image_url: { type: String },
  floor: { type: Number },
  floor_name: { type: String },
  floor_tag: { type: String },
  site: { type: Schema.Types.ObjectId, ref: "sites" },
  image_large_url: { type: String },
  x_pixel_offset: { type: Number },
  y_pixel_offset: { type: Number },
  x_scale: { type: Number },
  y_scale: { type: Number },
  img_width: { type: Number },
  img_height: { type: Number },
  xy_flipped: { type: Boolean },
});

export const Survey: Model<ISurvey> = model<ISurvey>("Survey", SurveySchema);
export const SurveyNode: Model<ISurveyNode> = model<ISurveyNode>(
  "survey_nodes",
  SurveyNodeSchema,
);
export const MinimapNode: Model<IMinimapNode> = model<IMinimapNode>(
  "minimap_nodes",
  MinimapNodeSchema,
);
export const MinimapConversion: Model<IMinimapConversion> =
  model<IMinimapConversion>("minimap_conversion", MinimapConversionSchema);
export const HotspotDescription: Model<IHotspotDescription> =
  model<IHotspotDescription>(
    "hotspot_description",
    HotspotDescriptionSchema,
    "hotspot_description",
  );
export const MinimapImages: Model<IMinimapImages> = model<IMinimapImages>(
  "minimap_images",
  MinimapImagesSchema,
);
