import { ObjectId, DeleteResult } from "mongodb";
import { MinimapConversion, IMinimapConversion } from "../models/SurveyModel";

export const findByFloorAndSite = async (
  floor: string,
  siteId: string,
): Promise<IMinimapConversion[]> => {
  return MinimapConversion.find({ floor, site: new ObjectId(siteId) }, "-_id")
    .populate("survey_node", "-_id")
    .populate("minimap_node", "-_id");
};

export const findOneBySurveyNodeWithRelated = async (
  surveyNodeId: string,
): Promise<IMinimapConversion | null> => {
  return MinimapConversion.findOne(
    { survey_node: new ObjectId(surveyNodeId) },
    "-_id",
  )
    .populate("survey_node", "-_id")
    .populate("minimap_node", "-_id");
};

export const findOneAndUpdate = async (
  surveyNodeId: string,
  x: number,
  y: number,
): Promise<IMinimapConversion | null> => {
  return MinimapConversion.findOneAndUpdate(
    { survey_node: new ObjectId(surveyNodeId) },
    {
      x: x,
      y: y,
    },
  );
};

export const findOneBySurveyNode = async (
  surveyNodeId: string,
): Promise<IMinimapConversion | null> => {
  return MinimapConversion.findOne({ survey_node: new ObjectId(surveyNodeId) });
};

export const deleteOneMinimapCvs = async (
  surveyNodeId: string,
): Promise<DeleteResult> => {
  return MinimapConversion.deleteOne({
    survey_node: new ObjectId(surveyNodeId),
  });
};

export const minimapConversionCreateOne = async (
  objectMini: IMinimapConversion,
): Promise<IMinimapConversion> => {
  return MinimapConversion.create(objectMini);
};

export const createMinimapConversion = async (
  data: IMinimapConversion,
): Promise<IMinimapConversion> => {
  return MinimapConversion.create(data);
};
