import { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { SurveyNode, ISurveyNode } from "../models/SurveyModel";

const findByDateAndSite = async (
  date: string,
  siteId: string,
): Promise<ISurveyNode[]> => {
  return SurveyNode.find({
    date: date,
    site: new Schema.Types.ObjectId(siteId),
  });
};

const getDocumentCounts = (site: string) => {
  return SurveyNode.countDocuments({
    site: new ObjectId(site),
  });
};

const getOneSurveyNode = async (tilesId: string, site: ObjectId) => {
  return SurveyNode.findOne({
    tiles_id: tilesId,
    site: site,
  });
};

export default { getDocumentCounts, findByDateAndSite, getOneSurveyNode };
