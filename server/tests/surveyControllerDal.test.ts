import { Request, Response } from "express";
import { SurveyController } from "../src/controller/SurveyController";
import {
  findByFloorAndSite,
  findOneBySurveyNodeWithRelated,
} from "../src/dal/minimapConversionsHandler";
import { findByDateAndSite } from "../src/dal/surveyNodesHandler";
import { mockResponse } from "./testUtils";
import { mocked } from "jest-mock";
import {
  mockSurveyNodes,
  mockMiniconverions,
  result,
} from "./sampleData/surveyControllerData";

jest.mock("../src/dal/minimapConversionsHandler");
jest.mock("../src/dal/surveyNodesHandler");

describe("getIndividualSurveysDetails", () => {
  it("should return surveys for a given floor and site", async () => {
    const req = {
      params: { siteId: "123" },
      query: { floor: "1" },
    } as Partial<Request>;
    const res = mockResponse() as Partial<Response>;
    const surveyController = new SurveyController();

    // Mock the DAL functions
    mocked(findByFloorAndSite).mockResolvedValue(mockMiniconverions);
    mocked(findByDateAndSite).mockResolvedValue(mockSurveyNodes);
    mocked(findOneBySurveyNodeWithRelated).mockResolvedValue(
      mockMiniconverions[0],
    );

    await surveyController.getIndividualSurveysDetails(
      req as Request,
      res as Response,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
