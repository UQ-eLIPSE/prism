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
  mockMinimapNode,
  mockMinimapImages,
  mockHotSpotDescription,
} from "./sampleData/surveyControllerData";
import surveyNodesHandler from "../src/dal/surveyNodesHandler";
import mapPinsHandler from "../src/dal/mapPinsHandler";
import minimapNodeHandler from "../src/dal/minimapNodeHandler";
import * as httpMocks from "node-mocks-http";
import minimmapImagesHandler from "../src/dal/minimmapImagesHandler";
import { IHotspotDescription, ISurveyNode } from "../src/models/SurveyModel";
import { ObjectId } from "mongodb";
import hotspotDescriptionHandler from "../src/dal/hotspotDescriptionHandler";

jest.mock("../src/dal/minimapConversionsHandler");
jest.mock("../src/dal/surveyNodesHandler");
jest.mock("../src/dal/mapPinsHandler");
jest.mock("../src/dal/minimapNodeHandler");
jest.mock("../src/dal/minimmapImagesHandler");
jest.mock("../src/dal/hotspotDescriptionHandler");

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

// TODO: FIX TESTS
describe.skip("getSurveyExistence", () => {
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

// TODO: FIX TESTS
describe.skip("getSurveyCompactVersion", () => {
  it(`findSurveysByFloor should be executed since a query for floor was provided `, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
      query: { floor: 1 },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(minimapNodeHandler.findSurveysByFloor).mockResolvedValue([
      mockMinimapNode[0],
    ]);

    await surveyController.getSurveyCompactVersion(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: [{ survey_name: "Survey 1", date: "2022-01-01", floor: 1 }],
    });
  });

  it(`findSurveyBySurveyNodeId should be executed since a query for date was provided `, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
      query: { date: "2022-01-01" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(surveyNodesHandler.findByDateAndSite).mockResolvedValue(
      mockSurveyNodes,
    );
    mocked(minimapNodeHandler.findSurveyBySurveyNodeId).mockResolvedValue([
      mockMinimapNode[0],
    ]);

    await surveyController.getSurveyCompactVersion(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: [{ survey_name: "Survey 1", date: "2022-01-01", floor: 1 }],
    });
  });

  it(`findSurveyBySiteID should be executed since no query was provided`, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(minimapNodeHandler.findSurveyBySiteID).mockResolvedValue(
      mockMinimapNode,
    );

    await surveyController.getSurveyCompactVersion(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: [
        { survey_name: "Survey 1", date: "2022-01-01" },
        { survey_name: "Survey 2", date: "2023-01-01" },
      ],
    });
  });

  it(`The response should result in a fail with a message "Surveys not found"`, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(minimapNodeHandler.findSurveyBySiteID).mockResolvedValue([]);

    await surveyController.getSurveyCompactVersion(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(400);
    expect(jsonData).toStrictEqual({
      message: "Surveys not found",
      success: false,
    });
  });
});

// TODO: FIX TESTS
describe.skip("getEmptyFloors", () => {
  it(`The response should result in a payload of one empty floor level 3 since no image was provided for it`, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(minimapNodeHandler.findSurveyBySiteIDWithID).mockResolvedValue(
      mockMinimapNode,
    );

    mocked(minimmapImagesHandler.findMinimapImagesBySiteId).mockResolvedValue(
      mockMinimapImages,
    );

    await surveyController.getEmptyFloors(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: { emptyFloors: [3], success: true },
    });
  });
});

//TODO: FIX TESTS
describe.skip("getFloorSurveyExistence", () => {
  it(`The response should result in a payload of one empty floor level 3 since no image was provided for it`, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123", floorId: "1" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(minimapNodeHandler.countMinimapNodeDocuments).mockResolvedValue(1);

    await surveyController.getFloorSurveyExistence(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: {
        site: "123",
        floor: "1",
        floorPopulated: true,
      },
    });
  });
});

// TODO: FIX TESTS
describe.skip("getMinimapImages", () => {
  it(`The response should result in a payload of one empty floor level 3 since no image was provided for it`, async () => {
    const req = httpMocks.createRequest({
      params: { siteId: "123" },
      query: { floor: 2 },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(
      minimmapImagesHandler.findMinimapImageByFloorAndSiteId,
    ).mockResolvedValue(mockMinimapImages[1]);

    await surveyController.getMinimapImage(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);
    expect(jsonData).toStrictEqual({
      message: "",
      success: true,
      payload: {
        floor: 2,
        floor_name: "First Floor",
        floor_tag: "F1",
        image_url: "https://example.com/floor2.png",
        image_large_url: "https://example.com/floor2_large.png",
        x_pixel_offset: 60,
        y_pixel_offset: 110,
        x_scale: 0.6,
        y_scale: 0.6,
        img_width: 1124,
        img_height: 868,
        xy_flipped: true,
        site: 123,
      },
    });
  });
});

describe("getIndividualHotSpotDescription test case", () => {
  it("should return the hotspot description for a given info id", async () => {
    const req = httpMocks.createRequest({
      query: { tilesId: "exampleTilesId" },
      params: { siteId: "60d6ec5a4ef0b2c8c7ec5958" },
    });

    const surveyController = new SurveyController();
    const resp = httpMocks.createResponse();

    mocked(surveyNodesHandler.getOneSurveyNode).mockResolvedValue({
      ...mockSurveyNodes[0],
      _id: new ObjectId("60d6ec5a4ef0b2c8c7ec5958"), // Mock MongoDB ObjectId
    } as ISurveyNode & { _id: ObjectId });

    mocked(
      hotspotDescriptionHandler.findHotspotDescriptionsByInfoIds,
    ).mockResolvedValue(
      mockHotSpotDescription.map((description) => ({
        ...description,
        _id: new ObjectId("60d6ec5a4ef0b2c8c7ec5958"), // Mock MongoDB ObjectId
      })) as (IHotspotDescription & {
        _id: ObjectId;
      })[],
    );

    await surveyController.getIndividualHotspotDescription(req, resp);

    const jsonData = resp._getJSONData();
    const statusCode = resp._getStatusCode();

    expect(statusCode).toBe(200);

    expect(jsonData).toStrictEqual({
      message: "",
      payload: mockHotSpotDescription,
      success: true,
    });
  });
});
