import { HotspotDescription } from "../models/SurveyModel";

const findHotspotDescriptionsByInfoIds = async (infoIds: string[]) => {
  return await HotspotDescription.find({
    info_id: { $in: infoIds },
  });
};

export default { findHotspotDescriptionsByInfoIds };
