import { ObjectId } from "mongodb";
import { MinimapConversion, IMinimapConversion } from "../models/SurveyModel";

export const findByFloorAndSite = async (
  floor: string,
  siteId: string,
): Promise<IMinimapConversion[]> => {
  return MinimapConversion.find({ floor, site: new ObjectId(siteId) }, "-_id")
    .populate("survey_node", "-_id")
    .populate("minimap_node", "-_id");
};

export const findOneBySurveyNode = async (
  surveyNodeId: string,
): Promise<IMinimapConversion | null> => {
  return MinimapConversion.findOne(
    { survey_node: new ObjectId(surveyNodeId) },
    "-_id",
  )
    .populate("survey_node", "-_id")
    .populate("minimap_node", "-_id");
};
