import { ObjectId } from "mongodb";
import { IMinimapImages, MinimapImages } from "../models/SurveyModel";

const findMinimapImagesBySiteId = async (
  siteID: string,
): Promise<IMinimapImages[]> => {
  return MinimapImages.find({
    site: new ObjectId(siteID),
  });
};

const findMinimapImageByFloorAndSiteId = async (
  floor: string,
  siteId: string,
): Promise<IMinimapImages | null> => {
  return MinimapImages.findOne({ floor, site: new ObjectId(siteId) }, "-_id");
};

export default {
  findMinimapImagesBySiteId,
  findMinimapImageByFloorAndSiteId,
};
