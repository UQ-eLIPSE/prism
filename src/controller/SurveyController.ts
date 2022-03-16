import { Request, Response } from "express";
import { CommonUtil } from "../utils/CommonUtil";
import { MantaService } from "../service/MantaService";
import * as multer from "multer";
import * as path from 'path';
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
  IHotspotDescription
} from "../models/SurveyModel";

const exec = require('child_process').exec;
const StreamZip = require('node-stream-zip');

interface IMantaOutput {
  fieldname: string,
  filename: string
}

export class SurveyController {

  public mantaService: MantaService;
  public writeLocally: multer.Multer;
  private localPath: string | null = null;

  constructor() {
    const { TMP_FOLDER } = process.env;
    this.localPath = path.join((<string>TMP_FOLDER || '~'));
    this.mantaService = new MantaService();
    this.writeLocally = multer({ dest: this.localPath });
  }

  /**
   * Upload survey and validate the files inside .zip
   * @param req
   * @param res
   */
  public async uploadSurvey(req: Request, res: Response) {
    let result: IMantaOutput[] = [];

    const { file } = req;
    const { surveyValidationMessage } = res.locals;

    if (!file) return CommonUtil.failResponse(res, 'File is not found');
    if (surveyValidationMessage) return CommonUtil.failResponse(res, surveyValidationMessage);

    else result = <any>file;

    const { TMP_FOLDER, MANTA_KEY_ID, MANTA_ROOT_FOLDER, MANTA_USER, MANTA_SUB_USER, MANTA_ROLES, MANTA_HOST_NAME, PROJECT_NAME } = process.env;
    const destPath = path.join(<string>TMP_FOLDER);

    const zip = new StreamZip({ file: `${file.destination}/${file.filename}`, storeEntries: true });

    zip.on('ready', async () => {
      const entries = Object.values(zip.entries());
      const extractedFolder = file.originalname.split('.')[0];
      SurveyService.extractZip(`${destPath}`, entries, zip).then(() => {
        const muntarcmd = `muntar -f ${destPath}/${extractedFolder}.tar /${MANTA_USER}/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}/${extractedFolder} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`;
        exec(`tar -cvf ${destPath}/${extractedFolder}.tar ${destPath}/${extractedFolder} && ${muntarcmd}`, { maxBuffer: 200 * 1024 * 1024 },
          (err: any) => {
            if (err !== null) {
              console.error(err);
              return;
            }
            console.log('tarball is created && muntarcmd has been executed');
          });
      });
    });

    return CommonUtil.successResponse(res, '', result);
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

    const allSurveys = await SurveyService.setSurveyPagination(maxResult, pageNo, size, res);
    return CommonUtil.successResponse(res, '', allSurveys);
  }

  /**
   * Query Survey based on floor and/or date and/or node number
   * @param req
   * @param res
   */
  public async getIndividualSurveysDetails(req: Request, res: Response) {
    const { floor, date } = req.query as any;
    let allSurveys: IMinimapConversion | any = [];
    let results: IMinimapConversion | any = [];

    if (floor) {
      allSurveys = await MinimapConversion.find({ floor }, '-_id')
        .populate('surveyNode', '-_id').populate('minimapNode', '-_id');

      results = allSurveys;

      if (!results) return CommonUtil.failResponse(res, 'Surveys with the floor number is not found');
    }

    if (date) {
      if (!floor && !allSurveys.length) {
        const surveyNode = await SurveyNode.find({ date });
        for (let node of surveyNode) {
          allSurveys.push(await MinimapConversion.findOne({ surveyNode: node._id }, '-_id')
            .populate('surveyNode', '-_id').populate('minimapNode', '-_id'));
        }
      }

      results = allSurveys.filter((survey: IMinimapConversion) => {
        const specificDate = date ? new Date(date).getTime() : new Date().getTime();
        const dbDate = survey.surveyNode.date ? new Date(survey.surveyNode.date).getTime() : new Date().getTime();
        return dbDate === specificDate;
      });
    }

    return CommonUtil.successResponse(res, '', results);
  }

  /**
   * Get all surveys name, date, and floor only based on floor or date
   * @param req
   * @param res
   */
  public async getSurveyCompactVersion(req: Request, res: Response) {
    const { floor, date } = req.query as any;

    let surveysWithFloor: IMinimapNode[] | null = null;
    let surveyWithDate: ISurveyNode[] | null = null;
    let results: any[] = [];
    const map = new Map();

    try {
      if (floor) {
        surveysWithFloor = await MinimapNode.find({ floor }, '-_id').populate('surveyNode', '-_id');
        if (!surveysWithFloor) return CommonUtil.failResponse(res, 'Survey with the floor number is not found');
        surveysWithFloor.map((survey) => {
          if (!map.has(survey.surveyNode.surveyName) || !map.has(floor)) {
            map.set(survey.surveyNode.surveyName, true);
            map.set(floor, true);

            return results.push({
              surveyName: survey.surveyNode.surveyName,
              date: survey.surveyNode.date,
              floor
            });
          }
        });
      }

      else if (date) {
        surveyWithDate = await SurveyNode.find({ date });
        if (!surveyWithDate) return CommonUtil.failResponse(res, 'Survey with the date is not found');

        for (let survey of surveyWithDate) {
          surveysWithFloor = await MinimapNode.find({ surveyNode: survey._id }, '-_id').populate('surveyNode', '-_id');

          if (!surveysWithFloor || !Array.isArray(surveysWithFloor)) throw new Error('Unable to fetch the data');
          surveysWithFloor.map((surveyData) => {

            if (!map.has(surveyData.surveyNode.surveyName) || !map.has(date) || !map.has(surveyData.floor)) {
              map.set(surveyData.surveyNode.surveyName, true);
              map.set(date, true);
              map.set(surveyData.floor, true);

              return results.push({
                surveyName: surveyData.surveyNode.surveyName,
                floor: surveyData.floor,
                date: date
              });
            }
          });
        }
      }
      else {
        surveysWithFloor = await MinimapNode.find({}).populate('surveyNode', '-_id');
        if (!surveysWithFloor) return CommonUtil.failResponse(res, 'Surveys not found');
        surveysWithFloor.map((survey) => {
          if (!map.has(survey.surveyNode.surveyName)) {
            map.set(survey.surveyNode.surveyName, true);

            return results.push({
              surveyName: survey.surveyNode.surveyName,
              date: survey.surveyNode.date,
            });
          }
        });
      }

      return CommonUtil.successResponse(res, '', results);
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
    const searchRegex = new RegExp(escape(query as string), 'gi');

    const maxResult = 10;
    const pageNo = parseInt(req.params.page) || 1;
    const size = parseInt(req.query.size as string) || maxResult;

    const fieldToSearchCount = {
      uploadedAt: searchRegex,
      uploadedBy: searchRegex,
      surveyName: searchRegex
    };

    const results = await SurveyService.setSurveyPagination(maxResult, pageNo, size, res, fieldToSearchCount);
    return CommonUtil.successResponse(res, '', results);
  }

  /**
   * Delete Survey
   * @param req
   * @param res
   */
  public async deleteSurvey(req: Request, res: Response) {
    const { id } = req.params;

    const surveyToBeDeleted = await Survey.findById(id);
    if (!surveyToBeDeleted) return CommonUtil.failResponse(res, 'Survey is not found');

    const surveyNodes = surveyToBeDeleted.surveyNodes;

    for (let surveyNode of surveyNodes) {
      await SurveyNode.findByIdAndRemove(id);
      const relatedMiniMapConversions = await MinimapConversion.findOne({ surveyNode: surveyNode });
      const relatedMinimapNode = await MinimapNode.findOne({ surveyNode: surveyNode });

      if (relatedMiniMapConversions) {
        await MinimapConversion.deleteOne({ surveyNode: surveyNode });
      }

      if (relatedMinimapNode) {
        await MinimapNode.deleteOne({ surveyNode: surveyNode });
      }
    }

    await Survey.findByIdAndDelete(id);
    return CommonUtil.successResponse(res, 'Survey has been successfully deleted');
  }

  /**
   * Query Hotspot Description based on tilesId
   * @param req
   * @param res
   */
  public async getIndividualHotspotDescription(req: Request, res: Response) {
    const { tilesId } = req.query as any;
    let allHotspotDescriptions: IHotspotDescription | any = [];
    let results: IHotspotDescription | any = [];

    try {

      if (!tilesId) throw new Error('TilesId not found.');
      const hotspotObject = await SurveyNode.findOne({ tilesId }, '-_id');
      if (!hotspotObject) throw new Error('hotspotObject not found.');

      const hotspotDescriptionInfoIds = hotspotObject.infoHotspots.map((e) => e.infoId);
      const hotspotDescs = await HotspotDescription.find({ infoId: { $in: hotspotDescriptionInfoIds } });

      if (hotspotDescs) allHotspotDescriptions = hotspotDescs;

      results = allHotspotDescriptions;
      return CommonUtil.successResponse(res, '', results);
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
    const { floor } = req.query as any;

    try {

      if (!floor) throw new Error('Floor not found.');

      const minimapImageObject = await MinimapImages.findOne({ floor }, '-_id');

      if (!minimapImageObject) throw new Error('minimapImageObject not found.');

      return CommonUtil.successResponse(res, '', minimapImageObject.minimap || []);

    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }
}