import { Request, Response } from "express";
import { CommonUtil } from "../utils/CommonUtil";
import { MantaService } from "../service/MantaService";
import * as multer from "multer";
import * as path from "path";
import { SurveyService } from "../service/SurveyService";
import {
  MinimapConversion,
  Survey,
  SurveyNode,
  MinimapNode,
  HotspotDescription,
  MinimapImages,
  IMinimapNode,
  IMinimapConversion,
  ISurveyNode,
  IHotspotDescription,
} from "../models/SurveyModel";
import { ObjectId } from "bson";
import { Site } from "../components/Site/SiteModel";
import { ConsoleUtil } from "../utils/ConsoleUtil";
import { ParsedQs } from "qs";

// these packages use require over import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = require("child_process").exec;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StreamZip = require("node-stream-zip");

interface IMantaOutput {
  fieldname: string;
  filename: string;
}

interface INodeReturnData {
  floor: number;
  node_number: number;
  tiles_id: string;
  tiles_name: string;
  survey_node: ISurveyNode;
  x: number;
  x_scale: number;
  y: number;
  y_scale: number;
  site: number;
  rotation: number;
}

export class SurveyController {
  public mantaService: MantaService;
  public writeLocally: multer.Multer;
  private localPath: string | null = null;

  constructor() {
    const { TMP_FOLDER } = process.env;
    this.localPath = path.join(<string>TMP_FOLDER || "~");
    this.mantaService = new MantaService();
    this.writeLocally = multer({ dest: this.localPath });
  }

  /**
   * uploadScenes
   * Uploads scenes with the provided zip and csv files on to Manta and DB
   * @param req
   * @param res
   * @returns
   */
  public async uploadScenes(req: Request, res: Response) {
    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const { siteId, floorId } = req.params;
      if (!files) throw new Error("File is undefined");

      if (!siteId) throw new Error("Site Id is not provided");

      // Get site
      const site = await Site.findById({ _id: new ObjectId(siteId) });
      if (!site) throw new Error("Invalid Site Id");

      const validate = await SurveyService.unzipValidateFile(
        files as {
          [fieldname: string]: Express.Multer.File[];
        },
        site,
      );

      if (!validate) throw new Error("Validation failed");

      await SurveyService.uploadToDB(files, site, floorId);

      return CommonUtil.successResponse(res, "Successfully uploaded");
    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * Upload survey and validate the files inside .zip
   * @param req
   * @param res
   */
  public uploadSurvey(req: Request, res: Response) {
    const { file } = req;
    const { surveyValidationMessage } = res.locals;

    /**
     * These are the first error checks
     */
    if (!file) return CommonUtil.failResponse(res, "File is not found");
    if (surveyValidationMessage)
      return CommonUtil.failResponse(res, surveyValidationMessage);

    const result = [file as IMantaOutput];

    const {
      TMP_FOLDER,
      MANTA_KEY_ID,
      MANTA_ROOT_FOLDER,
      MANTA_USER,
      MANTA_SUB_USER,
      MANTA_ROLES,
      MANTA_HOST_NAME,
      PROJECT_NAME,
    } = process.env;
    const destPath = path.join(<string>TMP_FOLDER);

    const zip = new StreamZip({
      file: `${file.destination}/${file.filename}`,
      storeEntries: true,
    });

    zip.on("ready", () => {
      const entries = Object.values(zip.entries());
      const extractedFolder = file.originalname.split(".")[0];
      SurveyService.extractZip(`${destPath}`, entries, zip).then(() => {
        // eslint-disable-next-line max-len
        const muntarcmd = `muntar -f ${destPath}/${extractedFolder}.tar /${MANTA_USER}/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}/${extractedFolder} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`;
        exec(
          // eslint-disable-next-line max-len
          `tar -cvf ${destPath}/${extractedFolder}.tar ${destPath}/${extractedFolder} && ${muntarcmd}`,
          { maxBuffer: 200 * 1024 * 1024 },
          (err: string) => {
            if (err !== null) {
              console.error(err);
              return;
            }
            ConsoleUtil.log(
              "tarball is created && muntarcmd has been executed",
            );
          },
        );
      });
    });

    return CommonUtil.successResponse(res, "", result);
  }

  /**
   * Get all surveys
   * @param req
   * @param res
   */
  public async getAllSurveys(req: Request, res: Response) {
    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    const size = parseInt(req.query.size as string) || maxResult;

    const allSurveys = await SurveyService.setSurveyPagination(
      maxResult,
      pageNo,
      size,
      res,
    );
    return CommonUtil.successResponse(res, "", allSurveys);
  }

  /**
   * Query Survey based on floor and/or date and/or node number
   * @param req
   * @param res
   */
  public async getIndividualSurveysDetails(req: Request, res: Response) {
    const { siteId } = req.params;
    const { floor, date } = req.query;
    let allSurveys: IMinimapConversion[] = [];
    let results: IMinimapConversion[] = [];

    if (!siteId)
      return CommonUtil.failResponse(res, "Site ID has not been provided");

    if (floor) {
      allSurveys = await MinimapConversion.find(
        { floor, site: new ObjectId(siteId) },
        "-_id",
      )
        .populate("survey_node", "-_id")
        .populate("minimap_node", "-_id");

      results = allSurveys;

      if (!results)
        return CommonUtil.failResponse(
          res,
          "Surveys with the floor number is not found",
        );
    }

    if (date) {
      if (!floor && !allSurveys.length) {
        const surveyNode = await SurveyNode.find({
          date: date,
          site: new ObjectId(siteId),
        });
        for (const node of surveyNode) {
          allSurveys.push(
            (await MinimapConversion.findOne({ survey_node: node._id }, "-_id")
              .populate("survey_node", "-_id")
              .populate("minimap_node", "-_id")) as IMinimapConversion,
          );
        }
      }

      results = allSurveys.filter((survey: IMinimapConversion) => {
        const specificDate = new Date().getTime();
        const dbDate = survey.survey_node.date
          ? new Date(survey.survey_node.date).getTime()
          : new Date().getTime();
        return dbDate === specificDate;
      });
    }

    return CommonUtil.successResponse(res, "", results);
  }

  /**
   * Return only node data for a given site.
   * @param req
   * @param res
   */
  public async getSingleSiteNodeData(req: Request, res: Response) {
    try {
      const { siteId, floorId } = req.params;
      const { date } = req.query;
      const allSurveys: IMinimapConversion[] = [];

      if (!siteId)
        return CommonUtil.failResponse(res, "Site ID has not been provided");

      if (!floorId) {
        return CommonUtil.failResponse(res, "Floor ID has not been provided");
      }

      if (!allSurveys.length) {
        const surveyNode = await SurveyNode.find({
          site: new ObjectId(siteId),
          date: date || undefined,
        });

        for (const node of surveyNode) {
          allSurveys.push(
            (await MinimapConversion.findOne({ survey_node: node._id }, "-_id")
              .populate("survey_node", "-_id")
              .populate("minimap_node", "-_id")) as IMinimapConversion,
          );
        }
      }

      const results: INodeReturnData[] = [];
      allSurveys.map((s: IMinimapConversion) => {
        if (s.floor == Number(floorId)) {
          results.push({
            floor: s.floor,
            node_number: s.survey_node.node_number,
            tiles_id: s.survey_node.tiles_id,
            tiles_name: s.survey_node.tiles_name,
            survey_node: s.minimap_node.survey_node,
            x: s.x,
            x_scale: s.x_scale,
            y: s.y,
            y_scale: s.y_scale,
            site: s.site,
            rotation: s.rotation,
          });
        }
      });

      return CommonUtil.successResponse(res, "", results);
    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * Get all surveys name, date, and floor only based on floor or date
   * @param req
   * @param res
   */
  public async getSurveyCompactVersion(req: Request, res: Response) {
    const { floor, date } = req.query;
    const { siteId } = req.params;

    let surveysWithFloor: IMinimapNode[] | null = null;
    let surveyWithDate: ISurveyNode[] | null = null;
    const results: {
      survey_name: string;
      date: string | string[] | ParsedQs | ParsedQs[];
      floor?: string | number | string[] | ParsedQs | ParsedQs[];
    }[] = [];
    const map = new Map();

    if (!siteId)
      return CommonUtil.failResponse(res, "Site ID has not been provided");

    try {
      if (floor) {
        surveysWithFloor = await MinimapNode.find(
          { floor, site: new ObjectId(siteId) },
          "-_id",
        ).populate("survey_node", "-_id");
        if (!surveysWithFloor)
          return CommonUtil.failResponse(
            res,
            "Survey with the floor number is not found",
          );
        surveysWithFloor.map((survey) => {
          if (!map.has(survey.survey_node.survey_name) || !map.has(floor)) {
            map.set(survey.survey_node.survey_name, true);
            map.set(floor, true);

            return results.push({
              survey_name: survey.survey_node.survey_name,
              date: survey.survey_node.date,
              floor,
            });
          }
        });
      } else if (date) {
        surveyWithDate = await SurveyNode.find({
          date,
          site: new ObjectId(siteId),
        });
        if (!surveyWithDate)
          return CommonUtil.failResponse(
            res,
            "Survey with the date is not found",
          );

        for (const survey of surveyWithDate) {
          surveysWithFloor = await MinimapNode.find(
            { survey_node: survey._id },
            "-_id",
          ).populate("survey_node", "-_id");

          if (!surveysWithFloor || !Array.isArray(surveysWithFloor))
            throw new Error("Unable to fetch the data");
          surveysWithFloor.map((surveyData) => {
            if (
              !map.has(surveyData.survey_node.survey_name) ||
              !map.has(date) ||
              !map.has(surveyData.floor)
            ) {
              map.set(surveyData.survey_node.survey_name, true);
              map.set(date, true);
              map.set(surveyData.floor, true);

              return results.push({
                survey_name: surveyData.survey_node.survey_name,
                floor: surveyData.floor,
                date: date,
              });
            }
          });
        }
      } else {
        surveysWithFloor = await MinimapNode.find({
          site: new ObjectId(siteId),
        }).populate("survey_node", "-_id");
        if (!surveysWithFloor)
          return CommonUtil.failResponse(res, "Surveys not found");
        surveysWithFloor.map((survey) => {
          if (!map.has(survey.survey_node.date.toString())) {
            map.set(survey.survey_node.date.toString(), true);

            return results.push({
              survey_name: survey.survey_node.survey_name,
              date: survey.survey_node.date,
            });
          }
        });
      }

      return CommonUtil.successResponse(res, "", results);
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * Search Surveys
   * @param req
   * @param res
   */
  public async searchSurvey(req: Request, res: Response) {
    const { query } = req.query;
    const searchRegex = new RegExp(escape(query as string), "gi");

    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    const size = parseInt(req.query.size as string) || maxResult;

    const fieldToSearchCount = {
      uploadedAt: searchRegex,
      uploadedBy: searchRegex,
      survey_name: searchRegex,
    };

    const results = await SurveyService.setSurveyPagination(
      maxResult,
      pageNo,
      size,
      res,
      fieldToSearchCount,
    );
    return CommonUtil.successResponse(res, "", results);
  }

  /**
   * Delete Survey
   * @param req
   * @param res
   */
  public async deleteSurvey(req: Request, res: Response) {
    const { id } = req.params;

    const surveyToBeDeleted = await Survey.findById(id);
    if (!surveyToBeDeleted)
      return CommonUtil.failResponse(res, "Survey is not found");

    const surveyNodes = surveyToBeDeleted.survey_nodes;

    for (const surveyNode of surveyNodes) {
      await SurveyNode.findByIdAndRemove(id);
      const relatedMiniMapConversions = await MinimapConversion.findOne({
        survey_node: surveyNode,
      });
      const relatedMinimapNode = await MinimapNode.findOne({
        survey_node: surveyNode,
      });

      if (relatedMiniMapConversions) {
        await MinimapConversion.deleteOne({ survey_node: surveyNode });
      }

      if (relatedMinimapNode) {
        await MinimapNode.deleteOne({ survey_node: surveyNode });
      }
    }

    await Survey.findByIdAndDelete(id);
    return CommonUtil.successResponse(
      res,
      "Survey has been successfully deleted",
    );
  }

  /**
   * Query Hotspot Description based on tilesId
   * @param req
   * @param res
   */
  public async getIndividualHotspotDescription(req: Request, res: Response) {
    const { tilesId } = req.query;
    const { siteId } = req.params;

    let allHotspotDescriptions: IHotspotDescription[] = [];
    let results: IHotspotDescription[] = [];

    try {
      if (!tilesId) throw new Error("TilesId not found.");
      if (!siteId) throw new Error("Site ID has not been provided");

      const hotspotObject = await SurveyNode.findOne(
        { tiles_id: tilesId, site: new ObjectId(siteId) },
        "-_id",
      );
      if (!hotspotObject) throw new Error("hotspotObject not found.");

      const hotspotDescriptionInfoIds = hotspotObject.info_hotspots.map(
        (e) => e.info_id,
      );
      const hotspotDescs = await HotspotDescription.find({
        info_id: { $in: hotspotDescriptionInfoIds },
      });

      if (hotspotDescs) allHotspotDescriptions = hotspotDescs;

      results = allHotspotDescriptions;
      return CommonUtil.successResponse(res, "", results);
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * Get correct minimap based on floor
   * @param req
   * @param res
   */
  public async getMinimapImage(req: Request, res: Response) {
    const { floor } = req.query;
    const { siteId } = req.params;

    try {
      if (!floor) throw new Error("Floor not found.");

      const minimapImageObject = await MinimapImages.findOne(
        { floor, site: new ObjectId(siteId) },
        "-_id",
      );

      if (!minimapImageObject) throw new Error("minimapImageObject not found.");

      return CommonUtil.successResponse(res, "", minimapImageObject || {});
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * Get minimap floor details
   * @param req
   * @param res
   */
  public async getMinimapFloors(req: Request, res: Response) {
    const { siteId } = req.params;

    try {
      if (!siteId) throw new Error("Site ID not entered");

      const minimapFloorObject = await MinimapImages.find({
        site: new ObjectId(siteId),
      });

      if (!minimapFloorObject) throw new Error("minimapFloorObject not found.");

      return CommonUtil.successResponse(res, "", minimapFloorObject || []);
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  public async addMinimapFloor(req: Request, res: Response) {
    const { siteId, floor } = req.params;

    try {
      if (!siteId) throw new Error("Site ID not entered");
      if (!floor) throw new Error("Floor not entered");

      const minimapFloorObject = await MinimapImages.find({
        site: new ObjectId(siteId),
        floor: floor,
      });

      if (JSON.stringify(minimapFloorObject) === "[]") {
        const addedMinimapFloorObject = await MinimapImages.create({
          _id: new ObjectId(),
          floor: floor,
          floor_name: "Level " + floor,
          floor_tag: floor,
          site: new ObjectId(siteId),
        });

        if (!addedMinimapFloorObject)
          throw new Error("Failed to add empty floor to database.");

        return CommonUtil.successResponse(
          res,
          "",
          addedMinimapFloorObject || [],
        );
      } else {
        return CommonUtil.successResponse(res, "", minimapFloorObject || []);
      }
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * createMinimap - Inserts Mini Map in to site Settings and upload
   * to Manta.
   * @param req
   * @param res
   * @returns Success Response if the upload/DB update has been successful
   */
  public async createMinimap(req: Request, res: Response) {
    const { file } = req;
    const { siteId } = req.params;
    const { floor } = req.query;

    try {
      const extNames = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"];

      if (!extNames.includes(path.extname(file?.path as string)))
        throw new Error("File is undefined");
      if (file === undefined) throw new Error("File is undefined");

      if (!siteId) throw new Error("Site Id is not provided");

      // Get site
      const site = await Site.findById({ _id: new ObjectId(siteId) });
      if (!site) throw new Error("Invalid Site Id");

      const uploadSiteMap = await SurveyService.createMinimap(
        file,
        parseInt(floor as string),
        site,
      );
      if (!uploadSiteMap.success) throw new Error(uploadSiteMap.message);

      return CommonUtil.successResponse(res, uploadSiteMap.message);
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * Updates the floor_name and floor_tag the selected minimap floor.
   * @param req
   * @param res
   * @returns Success Response if the upload/DB update has been successful
   */
  public async updateMinimapFloorDetails(req: Request, res: Response) {
    try {
      const { siteId } = req.params;
      const { floor_name, floor_tag, floor } = req.body;

      if (!siteId) throw new Error("Site Id is not provided");
      if (!floor && floor !== 0) throw new Error("Floor is not provided");
      if (!floor_name && !floor_tag)
        throw new Error("Floor name neither tag provided");
      if (floor_name === "" || floor_tag === "") {
        throw new Error(
          "Empty strings cannot be assigned to floor name or tag",
        );
      }

      const site = await Site.findById({ _id: new ObjectId(siteId) });
      if (!site) throw new Error("Invalid Site Id");

      const updateMinimapFloorDetails =
        await SurveyService.updateMinimapFloorDetails(
          site,
          parseInt(floor as string),
          floor_name,
          floor_tag,
        );

      if (!updateMinimapFloorDetails.success)
        throw new Error(updateMinimapFloorDetails.message);
      return CommonUtil.successResponse(res, updateMinimapFloorDetails.message);
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * getSurveyExistence - Returns booleans representing the existence of a
   * site and surveys in the database.
   * @param req
   * @param res
   * @returns site: SiteId, siteCreated: boolean, sitePopulated: boolean
   */
  public async getSurveyExistence(req: Request, res: Response) {
    const { siteId } = req.params;
    const result = {
      site: siteId,
      siteCreated: false,
      sitePopulated: false,
    };

    if (!siteId) {
      throw new Error("No Site ID Specified");
    }

    try {
      const siteCreated = await SurveyService.getSiteExistence(siteId);
      result.siteCreated = siteCreated.success;

      const sitePopulated = await SurveyService.getSitePopulated(siteId);
      result.sitePopulated = sitePopulated.success;

      return CommonUtil.successResponse(res, "", result);
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * getFloorSurveyExistence - Similar to getSurveyExistence, however,
   * returns the existence of a survey for a given floor and site.
   * @param req
   * @param res
   * @returns site: SiteId, floor: floorId, floorPopulated: boolean
   */
  public async getFloorSurveyExistence(req: Request, res: Response) {
    const { siteId, floorId } = req.params;

    const result = {
      site: siteId,
      floor: floorId,
      floorPopulated: false,
    };

    if (!siteId) {
      throw new Error("No Site ID Specififed");
    }

    if (!floorId) {
      throw new Error("No Floor ID Specified");
    }

    try {
      const floorPopulated = await SurveyService.getFloorPopulated(
        siteId,
        parseInt(floorId),
      );
      result.floorPopulated = floorPopulated.success;

      return CommonUtil.successResponse(res, "", result);
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * Updates the x and y coordinates of the selected node.
   * @param req
   * @param res
   * @returns
   */
  public async updateNodeCoordinates(req: Request, res: Response) {
    try {
      const { nodeId } = req.params;
      const { x, y } = req.body;

      const findNodeId = await MinimapConversion.find({
        survey_node: new ObjectId(nodeId),
      });
      if (!findNodeId) throw new Error("Node does not exist in database");

      const updateCoords = await SurveyService.updateNodeCoordinates(
        nodeId,
        x,
        y,
      );
      if (!updateCoords) throw new Error("Node coordinates cannot be updated");

      return CommonUtil.successResponse(
        res,
        "Minimap node coordinates have been updated",
      );
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * Updates the field of view of the selected node.
   * @param req
   * @param res
   * @returns
   */
  public async updateNodeRotation(req: Request, res: Response) {
    try {
      const { nodeId } = req.params;
      const { rotation } = req.body;

      const findNodeId = await MinimapConversion.find({
        survey_node: new Object(nodeId),
      });
      if (!findNodeId) throw new Error("Node does not exist in databae");

      const updateCoords = await SurveyService.updateNodeRotation(
        nodeId,
        rotation,
      );
      if (!updateCoords) throw new Error("Node rotation cannot be updated");

      return CommonUtil.successResponse(
        res,
        "Minimap node rotation has been updated",
      );
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }

  /**
   * returns the list of empty floors per a site ID
   * @param req
   * @param res
   * @returns An array containing all the floors that are not populate per the site id
   */
  public async getEmptyFloors(req: Request, res: Response) {
    const { siteId } = req.params;

    if (!siteId) {
      throw new Error("No Site ID Specififed");
    }

    try {
      const emptyFloors = await SurveyService.getEmptyFloors(siteId);

      return CommonUtil.successResponse(res, "", emptyFloors);
    } catch (e) {
      ConsoleUtil.log(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }
}
