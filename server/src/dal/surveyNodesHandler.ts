import { Schema } from "mongoose";
import { SurveyNode, ISurveyNode } from "../models/SurveyModel";

export const findByDateAndSite = async (
  date: string,
  siteId: string,
): Promise<ISurveyNode[]> => {
  return SurveyNode.find({
    date: date,
    site: new Schema.Types.ObjectId(siteId),
  });
};
