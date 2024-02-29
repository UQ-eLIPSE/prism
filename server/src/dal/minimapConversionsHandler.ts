import { ObjectId, DeleteResult } from "mongodb";
import { MinimapConversion, IMinimapConversion } from "../models/SurveyModel";
function typeGuardMiniConversion(obj: unknown): obj is IMinimapConversion {
  if (typeof obj !== "object" || obj === null) return false;

  const conversion = obj as IMinimapConversion;

  return (
    typeof conversion.floor === "number" &&
    typeof conversion.x === "number" &&
    typeof conversion.y === "number" &&
    typeof conversion.x_scale === "number" &&
    typeof conversion.y_scale === "number" &&
    typeof conversion.rotation === "number"
  );
}

export const findByFloorAndSite = async (
  floor: string,
  siteId: string,
): Promise<IMinimapConversion[]> => {
  const result: IMinimapConversion[] = await MinimapConversion.find(
    { floor, site: new ObjectId(siteId) },
    "-_id",
  )
    .populate("survey_node", "-_id")
    .populate("minimap_node", "-_id");

  // TODO: Use for future implementations of typeguards
  result.forEach((item) => {
    console.log(typeGuardMiniConversion(item));
  });
  return result;
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

export const createMinimapConversion = async (
  data: IMinimapConversion,
): Promise<IMinimapConversion> => {
  return MinimapConversion.create(data);
};

export const updateOneMinimapConversion = async (
  nodeId: string,
  data: Partial<IMinimapConversion>,
): Promise<IMinimapConversion | null> => {
  return MinimapConversion.findOneAndUpdate(
    { survey_node: new ObjectId(nodeId) },
    data,
  );
};
