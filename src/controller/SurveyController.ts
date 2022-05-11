import { Request, Response } from 'express';
import { CommonUtil } from '../utils/CommonUtil';
import { MantaService } from '../service/MantaService';
import * as multer from 'multer';
import * as path from 'path';
import { SurveyService } from '../service/SurveyService';
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
} from '../models/SurveyModel';
import { ObjectID } from 'bson';
import { Site } from '../components/Site/SiteModel';

const exec = require('child_process').exec;
const StreamZip = require('node-stream-zip');

interface IMantaOutput {
  fieldname: string;
  filename: string;
}

export class SurveyController {
  public mantaService: MantaService;
  public writeLocally: multer.Multer;
  private localPath: string | null = null;

  constructor() {
    const { TMP_FOLDER } = process.env;
    this.localPath = path.join(<string>TMP_FOLDER || '~');
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

      const { siteId } = req.params;
      if (!files) throw new Error('File is undefined');

      if (!siteId) throw new Error('Site Id is not provided');

      //Get site
      const site = await Site.findById({ _id: new ObjectID(siteId) });
      if (!site) throw new Error('Invalid Site Id');

      const validate = await SurveyService.unzipValidateFile(
        files as {
          [fieldname: string]: Express.Multer.File[];
        },
        site,
      );

      if (!validate) throw new Error('Validation failed');

      await SurveyService.uploadToDB(files, site);

      return CommonUtil.successResponse(res, 'Successfully uploaded');
    } catch (e) {
      return CommonUtil.failResponse(res, e.message);
    }
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
    if (surveyValidationMessage)
      return CommonUtil.failResponse(res, surveyValidationMessage);
    else result = <any>file;

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

    zip.on('ready', async () => {
      const entries = Object.values(zip.entries());
      const extractedFolder = file.originalname.split('.')[0];
      SurveyService.extractZip(`${destPath}`, entries, zip).then(() => {
        const muntarcmd = `muntar -f ${destPath}/${extractedFolder}.tar /${MANTA_USER}/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}/${extractedFolder} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`;
        exec(
          `tar -cvf ${destPath}/${extractedFolder}.tar ${destPath}/${extractedFolder} && ${muntarcmd}`,
          { maxBuffer: 200 * 1024 * 1024 },
          (err: any) => {
            if (err !== null) {
              console.error(err);
              return;
            }
            console.log('tarball is created && muntarcmd has been executed');
          },
        );
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

    const allSurveys = await SurveyService.setSurveyPagination(
      maxResult,
      pageNo,
      size,
      res,
    );
    return CommonUtil.successResponse(res, '', allSurveys);
  }

  /**
   * Query Survey based on floor and/or date and/or node number
   * @param req
   * @param res
   */
  public async getIndividualSurveysDetails(req: Request, res: Response) {
    const { siteId } = req.params;
    const { floor, date } = req.query as any;
    let allSurveys: IMinimapConversion | any = [];
    let results: IMinimapConversion | any = [];

    if (!siteId)
      return CommonUtil.failResponse(res, 'Site ID has not been provided');

    if (floor) {
      allSurveys = await MinimapConversion.find(
        { floor, site: new ObjectID(siteId) },
        '-_id',
      )
        .populate('survey_node', '-_id')
        .populate('minimap_node', '-_id');

      results = allSurveys;

      if (!results)
        return CommonUtil.failResponse(
          res,
          'Surveys with the floor number is not found',
        );
    }

    if (date) {
      if (!floor && !allSurveys.length) {
        const surveyNode = await SurveyNode.find({
          date: date,
          site: new ObjectID(siteId),
        });
        for (let node of surveyNode) {
          allSurveys.push(
            await MinimapConversion.findOne({ survey_node: node._id }, '-_id')
              .populate('survey_node', '-_id')
              .populate('minimap_node', '-_id'),
          );
        }
      }

      results = allSurveys.filter((survey: IMinimapConversion) => {
        const specificDate = date
          ? new Date(date).getTime()
          : new Date().getTime();
        const dbDate = survey.survey_node.date
          ? new Date(survey.survey_node.date).getTime()
          : new Date().getTime();
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
    const { siteId } = req.params;

    let surveysWithFloor: IMinimapNode[] | null = null;
    let surveyWithDate: ISurveyNode[] | null = null;
    let results: any[] = [];
    const map = new Map();

    if (!siteId)
      return CommonUtil.failResponse(res, 'Site ID has not been provided');

    try {
      if (floor) {
        surveysWithFloor = await MinimapNode.find(
          { floor, site: new ObjectID(siteId) },
          '-_id',
        ).populate('survey_node', '-_id');
        if (!surveysWithFloor)
          return CommonUtil.failResponse(
            res,
            'Survey with the floor number is not found',
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
          site: new ObjectID(siteId),
        });
        if (!surveyWithDate)
          return CommonUtil.failResponse(
            res,
            'Survey with the date is not found',
          );

        for (let survey of surveyWithDate) {
          surveysWithFloor = await MinimapNode.find(
            { survey_node: survey._id },
            '-_id',
          ).populate('survey_node', '-_id');

          if (!surveysWithFloor || !Array.isArray(surveysWithFloor))
            throw new Error('Unable to fetch the data');
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
          site: new ObjectID(siteId),
        }).populate('survey_node', '-_id');
        if (!surveysWithFloor)
          return CommonUtil.failResponse(res, 'Surveys not found');
        surveysWithFloor.map((survey) => {
          if (!map.has(survey.survey_node.survey_name)) {
            map.set(survey.survey_node.survey_name, true);

            return results.push({
              survey_name: survey.survey_node.survey_name,
              date: survey.survey_node.date,
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
      survey_name: searchRegex,
    };

    const results = await SurveyService.setSurveyPagination(
      maxResult,
      pageNo,
      size,
      res,
      fieldToSearchCount,
    );
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
    if (!surveyToBeDeleted)
      return CommonUtil.failResponse(res, 'Survey is not found');

    const surveyNodes = surveyToBeDeleted.survey_nodes;

    for (let surveyNode of surveyNodes) {
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
      'Survey has been successfully deleted',
    );
  }

  /**
   * Query Hotspot Description based on tilesId
   * @param req
   * @param res
   */
  public async getIndividualHotspotDescription(req: Request, res: Response) {
    const { tilesId } = req.query as any;
    const { siteId } = req.params;

    let allHotspotDescriptions: IHotspotDescription | any = [];
    let results: IHotspotDescription | any = [];

    try {
      if (!tilesId) throw new Error('TilesId not found.');
      if (!siteId) throw new Error('Site ID has not been provided');

      const hotspotObject = await SurveyNode.findOne(
        { tiles_id: tilesId, site: new ObjectID(siteId) },
        '-_id',
      );
      if (!hotspotObject) throw new Error('hotspotObject not found.');

      const hotspotDescriptionInfoIds = hotspotObject.info_hotspots.map(
        (e) => e.info_id,
      );
      const hotspotDescs = await HotspotDescription.find({
        info_id: { $in: hotspotDescriptionInfoIds },
      });

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
    const { siteId } = req.params;

    try {
      if (!floor) throw new Error('Floor not found.');

      const minimapImageObject = await MinimapImages.findOne(
        { floor, site: new ObjectID(siteId) },
        '-_id',
      );

      if (!minimapImageObject) throw new Error('minimapImageObject not found.');

      return CommonUtil.successResponse(
        res,
        '',
        minimapImageObject.minimap || [],
      );
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message || e);
    }
  }

  /**
   * createSiteMap - Inserts Site Map in to site Settings and upload
   * to Manta.
   * @param req
   * @param res
   * @returns Success Response if the upload/DB update has been successful
   */
  public async createSiteMap(req: Request, res: Response) {
    const { file } = req;
    const { siteId } = req.params;
    const { floor } = req.query;

    try {
      const extNames = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];

      if (!extNames.includes(path.extname(file?.path as string)))
        throw new Error('File is undefined');
      if (file === undefined) throw new Error('File is undefined');

      if (!siteId) throw new Error('Site Id is not provided');

      //Get site
      const site = await Site.findById({ _id: new ObjectID(siteId) });
      if (!site) throw new Error('Invalid Site Id');

      const uploadSiteMap = await SurveyService.createSiteMap(
        file,
        parseInt(floor as string),
        site,
      );
      if (!uploadSiteMap.success) throw new Error(uploadSiteMap.message);

      return CommonUtil.successResponse(res, uploadSiteMap.message);
    } catch (e) {
      console.error(e);
      return CommonUtil.failResponse(res, e.message);
    }
  }
}
