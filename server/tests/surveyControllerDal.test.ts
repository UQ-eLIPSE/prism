import { Request, Response } from "express";
import { SurveyController } from "../src/controller/SurveyController";
import {
  findByFloorAndSite,
  findOneBySurveyNodeWithRelated,
} from "../src/dal/minimapConversionsHandler";
import { mockResponse } from "./testUtils";
import { mocked } from "jest-mock";
import {
  mockSurveyNodes,
  mockMiniconverions,
  result,
  mockMapPins,
} from "./sampleData/surveyControllerData";
import surveyNodesHandler from "../src/dal/surveyNodesHandler";
import mapPinsHandler from "../src/dal/mapPinsHandler";

jest.mock("../src/dal/minimapConversionsHandler");
jest.mock("../src/dal/surveyNodesHandler");
jest.mock("../src/dal/mapPinsHandler");

describe("getIndividualSurveysDetails", () => {
  it("should return surveys for a given floor and site", async () => {
    const req = {
      params: { siteId: "123" },
      query: { floor: "1" },
    } as Partial<Request>;
    const res = mockResponse() as Partial<Response>;
    const surveyController = new SurveyController();

    // Mock the repository functions
    mocked(findByFloorAndSite).mockResolvedValue(mockMiniconverions);
    mocked(surveyNodesHandler.findByDateAndSite).mockResolvedValue(
      mockSurveyNodes,
    );
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

describe("getSurveyExistence", () => {
  it("siteCreated and sitePopulated should return true if surveys exist for a given floor and site", async () => {
    const req = {
      params: { siteId: "123" },
    } as Partial<Request>;
    const res = mockResponse() as Partial<Response>;

    const surveyController = new SurveyController();
    mocked(surveyNodesHandler.getDocumentCounts).mockResolvedValue(
      mockSurveyNodes.length,
    );

    mocked(mapPinsHandler.getDocumentCounts).mockResolvedValue(
      mockMapPins.length,
    );

    await surveyController.getSurveyExistence(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "",
      success: true,
      payload: { site: "123", siteCreated: true, sitePopulated: true },
    });
  });
});
