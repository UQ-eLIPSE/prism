import {Schema, Document, Model, model, Types} from 'mongoose';
var uuidv4 = require('uuidv4');


export interface IMinimapConversion extends Document {
  floor: number;
  xPixelOffset: number;
  yPixelOffset: number;
  xPixelPerMeter: number;
  yPixelPerMeter: number;
  surveyNode: ISurveyNode;
  minimapNode: IMinimapNode;
}

export interface IMinimapNode extends Document {
  nodeNumber: number;
  title: string;
  description: string;
  minimapConversion: IMinimapConversion;
  surveyNode: ISurveyNode;
  floor: number;
}

export interface IInitialParams extends Document {
  pitch: number;
  yaw: number;
  fov: number;
}

export interface IInfoHotspot extends Document {
  surveyNode: ISurveyNode;
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
  infoId: string;
}

export interface ILinkHotspot extends Document {
  surveyNode: ISurveyNode;
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
}

export interface ISurveyNode extends Document {
  uploadedAt: string;
  uploadedBy: string;
  date: string;
  nodeNumber: number;
  surveyName: string;
  tilesId: string;
  tilesName: string;
  initialParameters: IInitialParams;
  linkHotspots: ILinkHotspot[];
  infoHotspots: IInfoHotspot[];
  levels: any[]; // Cannot be mapped because of how Marzipano export the data for levels,
  faceSize: number;
}

export interface ISurvey extends Document{
  surveyName: string;
  surveyNodes: ISurveyNode[];
}

export interface IHeaderInfo extends Document{
  mainImgUrl: string;
  labelTitle: string;
}

export interface IContentSection extends Document{
  title: string;
  content: string;
}

export interface IHotspotDescription extends Document{
  header: IHeaderInfo;
  contents: IContentSection[];
  tilesId: string;
  infoId: string;
}

export interface IMinimapImages extends Document {
  minimap: string;
  floor: number;
}

const SurveySchema: Schema = new Schema({
  surveyName: {type: String},
  surveyNodes: [{type: Schema.Types.Mixed, ref: 'SurveyNode'}]
});

const SurveyNodeSchema: Schema = new Schema({
  surveyName: {type: String},
  uploadedAt: {type: Date},
  uploadedBy: {type: String, ref: "User"},
  mantaLink: {type: String},
  date: {type: Date},
  nodeNumber: {type: Number},
  tilesId: {type: String},
  tilesName: {type: String},
  initialParameters: {type: Schema.Types.Mixed},
  linkHotspots: [Schema.Types.Mixed],
  infoHotspots: [Schema.Types.Mixed],
  levels: [Schema.Types.Mixed],
  faceSize: {type: Number}
});

const MinimapNodeSchema: Schema = new Schema({
  nodeNumber: {type: Number},
  tilesId:{type: String},
  tilesName: {type: String},
  surveyNode: {type: Schema.Types.Mixed, ref: "SurveyNode"},
  floor: {type: Number}
});

const MinimapConversionSchema: Schema = new Schema({
  floor: {type: Number},
  xPixelOffset: {type: Number},
  yPixelOffset: {type: Number},
  xPixelPerMeter: {type: Number},
  yPixelPerMeter: {type: Number},
  surveyNode: {type: Schema.Types.Mixed, ref: "SurveyNode"},
  minimapNode: {type: Schema.Types.Mixed, ref: "MinimapNode"}
});

const HotspotDescriptionSchema: Schema = new Schema({
  header: {type: Schema.Types.Mixed},
  contents: [Schema.Types.Mixed],
  tilesId: {type: String, ref: "SurveyNode"},
  infoId: {type: String, default: uuidv4}
});

const MinimapImagesSchema: Schema = new Schema({
  minimap: {type: String},
  floor: {type: Number}
});

export const Survey: Model<ISurvey> = model<ISurvey>('Survey', SurveySchema);
export const SurveyNode: Model<ISurveyNode> = model<ISurveyNode>('SurveyNode', SurveyNodeSchema);
export const MinimapNode: Model<IMinimapNode> = model<IMinimapNode>('MinimapNode', MinimapNodeSchema);
export const MinimapConversion: Model<IMinimapConversion> = model<IMinimapConversion>('MinimapConversion', MinimapConversionSchema);
export const HotspotDescription: Model<IHotspotDescription> = model<IHotspotDescription>('HotspotDescription', HotspotDescriptionSchema, 'hotspotdescription');
export const MinimapImages: Model<IMinimapImages> = model<IMinimapImages>('MinimapImages', MinimapImagesSchema);