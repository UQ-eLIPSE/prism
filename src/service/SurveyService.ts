import { Request, Response, NextFunction } from 'express-serve-static-core';
import { ISite, SiteSettings } from '../components/Site/SiteModel';
import {
  SurveyNode,
  MinimapConversion,
  MinimapNode,
  Survey,
  IMinimapNode,
  MinimapImages,
} from '../models/SurveyModel';
import { CommonUtil } from '../utils/CommonUtil';
import * as fs from 'fs/promises';
import { execSync } from 'child_process';
import { ObjectId } from 'bson';
const StreamZip = require('node-stream-zip');

export abstract class SurveyService {
  static async readZipFile(req: Request, res: Response, next: NextFunction) {
    const { file } = req;
    const { user } = res.locals;
    if (file !== undefined) {
      const zip = new StreamZip({
        file: `${file.destination}/${file.filename}`,
        storeEntries: true,
      });
      let message: string;

      zip.on('ready', async () => {
        const entries = Object.values(zip.entries());
        const appFilesExist = entries.some(
          (entry: any) =>
            entry.name.endsWith('app-files/') && entry.isDirectory,
        );
        const surveyJsonExist = entries.some((entry: any) =>
          entry.name.endsWith('survey.json'),
        );
        const dataJsExist = entries.some((entry: any) =>
          entry.name.includes('app-files/data.js'),
        );

        if (surveyJsonExist && appFilesExist && dataJsExist) {
          let surveyJson: any[] = [];

          SurveyService.readSurveyJson(entries, zip).then((data: any[]) =>
            data.map((survey) => surveyJson.push(survey)),
          );

          let surveyIds: any = await SurveyService.readFileData(
            user,
            entries,
            zip,
          );
          const surveyIdsArr = Array.from(surveyIds);

          if (surveyIdsArr.length !== surveyJson.length) {
            // Delete the record from database
            for (let idx = 0; idx < surveyIdsArr.length; idx++) {
              const surveysTable = await Survey.findOne({
                surveyNodes: surveyIdsArr[idx] as any,
              });

              await SurveyNode.findByIdAndDelete(surveyIdsArr[idx]);
              await MinimapConversion.findOneAndDelete({
                surveyNode: surveyIdsArr[idx] as any,
              });
              await MinimapNode.findOneAndDelete({
                surveyNode: surveyIdsArr[idx] as any,
              });

              if (surveysTable) {
                await Survey.findByIdAndDelete(surveysTable._id);
              }
            }

            message =
              'Number of scenes in survey.json does not match number of scenes from marzipano';
            res.locals.surveyValidationMessage = message;
            next();
          } else {
            for (let idx = 0; idx < surveyIdsArr.length; idx++) {
              const minimapConversion = await MinimapConversion.findOne({
                surveyNode: surveyIdsArr[idx] as any,
              });
              const surveyNode = await SurveyNode.findById(surveyIdsArr[idx]);

              if (surveyNode) {
                await SurveyNode.findByIdAndUpdate(surveyIdsArr[idx], {
                  date: surveyJson[idx]['date'],
                });
              }

              if (minimapConversion) {
                const minimapNode = await MinimapNode.findOne({
                  surveyNode: surveyIdsArr[idx] as any,
                });
                await MinimapConversion.findOneAndUpdate(
                  { surveyNode: surveyIdsArr[idx] as any },
                  {
                    floor: surveyJson[idx]['floor'],
                    xPixelOffset: surveyJson[idx]['x_pixel_offset'],
                    yPixelOffset: surveyJson[idx]['y_pixel_offset'],
                    xPixelPerMeter: surveyJson[idx]['x_pixel_per_meter'],
                    yPixelPerMeter: surveyJson[idx]['y_pixel_per_meter'],
                    minimapNode: (<IMinimapNode>minimapNode)._id || null,
                  },
                );

                await MinimapNode.findOneAndUpdate(
                  { surveyNode: surveyIdsArr[idx] as any },
                  {
                    floor: surveyJson[idx]['floor'],
                  },
                );
              }
            }
          }
        } else {
          if (!surveyJsonExist) message = 'survey.json is missing';
          if (!appFilesExist) message = 'app-files folder is missing';
          if (!dataJsExist) message = 'data.js is missing';
          zip.close();
        }

        res.locals.surveyValidationMessage = message;
        next();
      });
    }
  }

  static async readFileData(userDetails: any, entries: any, zip: any) {
    const dataJs = entries.filter((entry: any) =>
      entry.name.endsWith('/data.js'),
    );
    let marzipanoData: any;
    let surveyNodeIds = new Set();
    let outputFile: any = [];

    const { MANTA_ROOT_FOLDER, PROJECT_NAME, MANTA_USER, MANTA_HOST_NAME } =
      process.env;
    return new Promise((resolve, reject) => {
      for (let data of dataJs) {
        zip.stream((<any>data).name, (err: any, stream: any) => {
          stream.on('data', (chunk: any) => {
            outputFile.push(chunk);
          });

          stream.on('end', async () => {
            marzipanoData = Buffer.concat(outputFile).toString('utf8');
            if (marzipanoData) {
              marzipanoData = marzipanoData.split('=')[1].replace(';', '');
              marzipanoData = JSON.parse(marzipanoData);

              const newSurvey = new Survey({ surveyName: marzipanoData.name });
              await newSurvey.save();

              for (let idx = 0; idx < marzipanoData.scenes.length; idx++) {
                const date = new Date().getTime();
                const newSurveyNode = new SurveyNode({
                  surveyName: marzipanoData.name,
                  uploadedAt: date,
                  uploadedBy: userDetails['username'],
                  mantaLink: `${MANTA_HOST_NAME}/${MANTA_USER}/${MANTA_ROOT_FOLDER}/${PROJECT_NAME}/${entries[0].name}`,
                  nodeNumber: idx,
                  tilesId: marzipanoData.scenes[idx].id,
                  tilesName: marzipanoData.scenes[idx].name,
                  initialParameters:
                    marzipanoData.scenes[idx].initialViewParameters,
                  linkHotspots: marzipanoData.scenes[idx].linkHotspots,
                  infoHotspots: marzipanoData.scenes[idx].infoHotspots,
                  levels: marzipanoData.scenes[idx].levels,
                  faceSize: marzipanoData.scenes[idx].faceSize,
                });

                await newSurveyNode.save();
                surveyNodeIds.add(newSurveyNode._id);

                await Survey.findOneAndUpdate(
                  { _id: newSurvey._id },
                  { $push: { surveyNodes: newSurveyNode._id } },
                );

                const newMinimapCoversion = new MinimapConversion({
                  surveyNode: newSurveyNode._id,
                });
                await newMinimapCoversion.save();

                const newMinimapNode = new MinimapNode({
                  nodeNumber: idx,
                  tilesId: marzipanoData.scenes[idx].id,
                  tilesName: marzipanoData.scenes[idx].name,
                  surveyNode: newSurveyNode._id,
                });

                await newMinimapNode.save();
              }

              resolve(surveyNodeIds);
            }

            zip.close();
          });
          stream.on('error', reject);
        });
      }
    });
  }

  static async readSurveyJson(entries: any, zip: any) {
    const surveyJson = entries.filter((entry: any) =>
      entry.name.endsWith('survey.json'),
    );
    let minimapData: any;

    return new Promise((resolve, reject) => {
      zip.stream((<any>surveyJson)[0].name, (err: any, stream: any) => {
        stream.on('data', async (chunk: any) => {
          minimapData = chunk.toString('utf8');
          if (minimapData) {
            minimapData = JSON.parse(minimapData);
            resolve(minimapData);
          }
        });

        stream.on('end', () => zip.close());
        stream.on('error', reject);
      });
    });
  }

  static async setSurveyPagination(
    maxResult: number,
    pageNo: number,
    size: number,
    res: Response,
    fieldToSearch?: object,
  ) {
    let mongoQuery: any = {};

    mongoQuery.limit = size;
    mongoQuery.skip = size * pageNo - size;

    const allSurveys = await Survey.find(fieldToSearch as any, {}, mongoQuery);
    if (!allSurveys) return CommonUtil.failResponse(res, 'No survey is found');

    const totalCount = await Survey.countDocuments(fieldToSearch as any);
    const nextPage =
      pageNo < Math.ceil(totalCount / size) ? pageNo + 1 : pageNo;

    return {
      currentPage: pageNo,
      pageSize: size,
      totalPages: Math.ceil(totalCount / size),
      nextPage: nextPage,
      surveys: allSurveys,
    };
  }

  public static extractZip(destPath: string, entries: any, zip: any) {
    return new Promise(async (resolve) => {
      zip.extract(null, destPath, (err: any) => {
        console.log(err ? 'Extract error' : `Extracted entries`);
        zip.close();
        resolve('');
      });
    });
  }

  public static async updateNodeCoordinates(
      nodeId: string,
      x: Number,
      y: Number
    ) {
        const updateNodeCoords = await MinimapConversion.findOneAndUpdate(
            { survey_node: new ObjectId(nodeId) },
            {
                x: x,
                y: y,
            },
        );

        return (updateNodeCoords ? true : false);
    }

    public static async updateNodeFov(
        nodeId: string,
        fov: Number
    ) {
        const updateNodeFov = await SurveyNode.findOneAndUpdate(
            { site: new ObjectId(nodeId) },
            {
                initial_parameters: {
                    fov: fov,
                }
            }
        )

        return (updateNodeFov ? true : false);
    }

  /**
   * createSiteMap - - Inserts Site Map in to site Settings and upload
   * to Manta.
   * @param file - Uploaded file
   * @param site - Provided Site
   * @returns
   */
  public static async createSiteMap(
    file: Express.Multer.File,
    floor: Number,
    site: ISite,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const {
        MANTA_ROOT_FOLDER,
        MANTA_HOST_NAME,
        MANTA_SUB_USER,
        MANTA_ROLES,
        MANTA_USER,
        MANTA_KEY_ID,
      } = process.env;
      if (file === undefined) throw new Error('File is undefined');

      // Upload on to Manta
      const upload = execSync(
        `mput -f ${file.path} ${MANTA_ROOT_FOLDER} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --keyId=${MANTA_KEY_ID} --role=${MANTA_ROLES} --url=${MANTA_HOST_NAME}`,
      );

      if (!upload) throw new Error("Site map couldn't be uploaded.");

      const getCurrentSiteMap = await MinimapImages.findOne(
        { floor, site: new ObjectId(site._id) },
        '-_id',
      );

      const saveSiteMap = getCurrentSiteMap ?
        await MinimapImages.findOneAndUpdate(
            { site: site._id },
            {
                image_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
                image_large_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
            }
        ) :
        await MinimapImages.create(
            {
                _id: new ObjectId(),
                image_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
                image_large_url: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.filename}`,
                floor: floor,
                site: site._id,
                x_pixel_offset: 0,
                y_pixel_offset: 0,
                x_scale: 1,
                y_scale: 1,
                img_width: 1000,
                img_height: 1000,
                xy_flipped: false,
            }
        );

      if (!saveSiteMap) throw new Error('Site Map Cannot Be Saved');

      // Delete file from local tmp.
      await fs.unlink(file.path);

      return {
        success: true,
        message: 'Site Map has been saved',
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  }
}
