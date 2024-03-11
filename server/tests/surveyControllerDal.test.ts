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
import * as httpMocks from "node-mocks-http";

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

    // Mock the DAL functions
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
  it(`siteCreated and sitePopulated should return true if surveys exist for a
given floor and site`, async () => {
    const req: httpMocks.MockRequest<Request> = httpMocks.createRequest({
      params: { siteId: "123" },
    });

    const resp = httpMocks.createResponse();

    const surveyController = new SurveyController();
    mocked(surveyNodesHandler.getDocumentCounts).mockResolvedValue(
      mockSurveyNodes.length,
    );

    mocked(mapPinsHandler.getDocumentCounts).mockResolvedValue(
      mockMapPins.length,
    );

    await surveyController.getSurveyExistence(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);

    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: { site: "123", siteCreated: true, sitePopulated: true },
    });
  });

  it(`siteCreated should return false if no map pins exist `, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(surveyNodesHandler.getDocumentCounts).mockResolvedValue(
      mockSurveyNodes.length,
    );

    mocked(mapPinsHandler.getDocumentCounts).mockResolvedValue(0);

    await surveyController.getSurveyExistence(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);

    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: { site: "123", siteCreated: false, sitePopulated: true },
    });
  });

  it(`sitePopulated should return false if no survey nodes exist `, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(surveyNodesHandler.getDocumentCounts).mockResolvedValue(0);

    mocked(mapPinsHandler.getDocumentCounts).mockResolvedValue(
      mockMapPins.length,
    );

    await surveyController.getSurveyExistence(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: { site: "123", siteCreated: true, sitePopulated: false },
    });
  });
});
