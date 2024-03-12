import { ObjectId } from "mongodb";
import { IMinimapImages, MinimapImages } from "../models/SurveyModel";

const findMinimapImagesBySiteId = async (
  siteID: string,
): Promise<IMinimapImages[]> => {
  return MinimapImages.find({
    site: new ObjectId(siteID),
  });
};

export default {
  findMinimapImagesBySiteId,
};
