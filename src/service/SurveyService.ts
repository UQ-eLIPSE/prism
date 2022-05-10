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
import csv = require('csvtojson');
import process = require('process');
import { execSync } from 'child_process';
import { ObjectId } from 'bson';
import { uploadZipManta } from '../utils/mantaUtil';
const StreamZip = require('node-stream-zip');

interface CSVProperties {
  level?: string;
  title?: string;
  fileName: string;
  x: string;
  y: string;
}
export abstract class SurveyService {
  /**
   * unzipValidateFile
   * @param files
   * @param site
   * @returns Boolean response of true or false of success
   */
  static async unzipValidateFile(
    files: {
      [fieldname: string]: Express.Multer.File[];
    },
    site: ISite,
  ) {
    try {
      const { zipFile, properties } = files;

      // Check if the files are zip and csv.
      if (
        zipFile[0].mimetype !== 'application/zip' &&
        properties[0].mimetype !== 'text/csv'
      )
        throw new Error('Invalid file types');

      // Create a zip stream for the zip file.
      const zip = new StreamZip({
        file: `${zipFile[0].path}`,
        storeEntries: true,
      });

      // Folder without .zip ext
      const extractedFolder = zipFile[0].filename.replace('.zip', '');

      zip.on('error', (err: any) => {
        console.error(err);
      });

      // Get Open CSV and convert to JSON.
      const csvJSON: CSVProperties[] = await csv().fromFile(properties[0].path);
      if (!csvJSON) throw new Error('Incorrect CSV format');

      const zipOp = await new Promise(async (resolve, reject) => {
        await zip.on('ready', async () => {
          const entries = Object.values(zip.entries());

          // Check if the images exist
          for (const field of csvJSON) {
            const checkImageExist = entries.some((entry: any) =>
              entry.name.includes(`${field.fileName}`),
            );
            if (!checkImageExist)
              reject(
                'Image does not exist, please upload your CSV file again with the correct file name.',
              );
          }

          // Check Marzipano app files exist
          const appFilesExist = entries.some(
            (entry: any) =>
              entry.name.endsWith('app-files/') && entry.isDirectory,
          );

          // Check Data.js exists as part of the Marzipano zip.
          const dataJsExist = entries.some((entry: any) =>
            entry.name.includes('app-files/data.js'),
          );

          if (!appFilesExist || !dataJsExist)
            reject('Marzipano folder structure is not correct');

          // Extract zip
          await zip.extract(
            null,
            `tmp/${zipFile[0].filename.replace('.zip', '')}`,
            (err: any) => {
              console.log(err ? 'Extract error' : 'Extracted');
              zip.close();

              err ? reject() : resolve('Extracted');
            },
          );
        });
      });

      if (!zipOp) throw new Error('Zip op failed');

      // Check data.js and match the tile names
      const readData = await fs.readFile(
        `tmp/${zipFile[0].filename.replace('.zip', '')}/app-files/data.js`,
        'utf-8',
      );

      // Check file name against the tiles.
      for (const field of csvJSON) {
        if (!readData.includes(field.fileName))
          throw new Error('Image does not exist in the Marzipano zip file.');
      }

      // Upload tiles to Manta using Manta-Sync
      const uploadZip = await uploadZipManta(extractedFolder, site.tag );
      if (!uploadZip) return false;

      return true;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }

  /**
   * Upload to DB
   * This function uploads data from the provided CSV and data.js
   * @param files
   * @param site
   * @returns Boolean response of true or false of success
   */
  static async uploadToDB(
    files: {
      [fieldname: string]: Express.Multer.File[];
    },
    site: ISite,
  ) {
    try {
      const { zipFile, properties } = files;
      // Convert CSV to JSON
      const csvJSON: CSVProperties[] = await csv().fromFile(properties[0].path);
      if (!csvJSON) throw new Error('Incorrect CSV format');

      const extractedFolder = zipFile[0].filename.replace('.zip', '');

      // Read from data.js
      const dataJS = await fs.readFile(
        `tmp/${extractedFolder}/app-files/data.js`,
        'utf8',
      );

      const stringedJSONData = dataJS
        .replace('var APP_DATA = ', '')
        .replace(/;/g, '');

      const data = JSON.parse(stringedJSONData);

      if (!data.scenes) throw new Error('Scenes are not available');

      const { MANTA_HOST_NAME, MANTA_ROOT_FOLDER } = process.env;

      const scenes: any[] = data.scenes;

      // Upload data to DB
      await new Promise((resolve, reject) => {
        scenes.forEach(async (scene, i) => {
          // Get CSV Element using the scene ID.
          const specElem = csvJSON.find((el) => el.fileName === scene.id);

          // Upload Survey Nodes from DataJS

          const survey = await SurveyNode.create([
            {
              _id: new ObjectId(),
              info_hotspots: scene.infoHotspots,
              link_hotspots: scene.linkHotspots,
              levels: scene.levels,
              face_size: scene.face_size,
              initial_parameters: scene.initialViewParameters,
              manta_link: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${site.tag}/`,
              node_number: i,
              survey_name: scene.name,
              tiles_id: scene.id,
              tiles_name: specElem?.title ? specElem?.title : scene.name,
              date: '2021-11-16T00:00:00.000+10:00',
              site: new ObjectId(site._id),
            },
          ]);

          // Upload to minimap nodes
          const minimapNode = await MinimapNode.create([
            {
              _id: new ObjectId(),
              floor: specElem?.level ? specElem.level : 0,
              node_number: i,
              survey_node: new ObjectId(survey[0]._id),
              tiles_id: scene.id,
              tiles_name: specElem?.title ? specElem?.title : scene.name,
              site: new ObjectId(site._id),
            },
          ]);

          // Upload Minimap conversions with the provided x/y coords from the CSV

          await MinimapConversion.create([
            {
              _id: new ObjectId(),
              floor: specElem?.level ? specElem.level : 0,
              minimap_node: new ObjectId(minimapNode[0]._id),
              survey_node: new ObjectId(survey[0]._id),
              x: specElem?.x,
              x_scale: 1,
              y: specElem?.y,
              y_scale: 1,
              site: new ObjectId(site._id),
            },
          ]);

          //Link/Info Hotspots if included *TODO in different ticket*
        });
        resolve('Data Uploaded');
      });

      //Delete files and folder
      await fs.unlink(properties[0].path);
      await fs.unlink(zipFile[0].path);
      await fs.rmdir(`tmp/extractedFolder`);

      return true;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }

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

      // Save in minimap Images
      const saveSiteMap = await MinimapImages.create({
        _id: new ObjectId(),
        minimap: `${MANTA_HOST_NAME}${MANTA_ROOT_FOLDER}/${file.originalname}`,
        floor: floor,
        site: site._id,
      });

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

