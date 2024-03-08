import { ObjectId, DeleteResult } from "mongodb";
import { MinimapNode, IMinimapNode, ISurveyNode } from "../models/SurveyModel";

const findSurveysByFloor = async (
  floor: string,
  siteID: string,
): Promise<IMinimapNode[]> => {
  const result: IMinimapNode[] = await MinimapNode.find(
    { floor, site: new ObjectId(siteID) },
    "-id",
  ).populate("survey_node", "-_id");
  return result;
};

const findSurveyBySurveyNodeId = async (
  surveyNodeId: string,
): Promise<IMinimapNode[]> => {
  const result: IMinimapNode[] = await MinimapNode.find(
    { survey_node: new ObjectId(surveyNodeId) },
    "-_id",
  ).populate("survey_node", "-_id");
  return result;
};

const findSurveyBySiteID = async (siteID: string): Promise<IMinimapNode[]> => {
  const result: IMinimapNode[] = await MinimapNode.find(
    { site: new ObjectId(siteID) },
    "-_id",
  ).populate("survey_node", "-_id");
  return result;
};

const findMinimapNodeBySurveyNode = async (
  surveyNode: ISurveyNode,
): Promise<IMinimapNode | null> => {
  return MinimapNode.findOne({
    survey_node: surveyNode,
  });
};

const deleteMinimapNode = async (
  surveyNode: ISurveyNode,
): Promise<DeleteResult> => {
  return MinimapNode.deleteOne({
    survey_node: surveyNode,
  });
};

const createMinimapNode = async (
  data: IMinimapNode[],
): Promise<IMinimapNode[]> => {
  return MinimapNode.create(data);
};

export default {
  findSurveysByFloor,
  findSurveyBySurveyNodeId,
  findSurveyBySiteID,
  findMinimapNodeBySurveyNode,
  deleteMinimapNode,
  createMinimapNode,
};
