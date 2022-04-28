import { Request, Response, NextFunction } from 'express-serve-static-core';
import { ISite } from '../components/Site/SiteModel';
import {
  SurveyNode,
  MinimapConversion,
  MinimapNode,
  Survey,
  IMinimapNode,
} from '../models/SurveyModel';
import { CommonUtil } from '../utils/CommonUtil';
import * as fs from 'fs/promises';
import csv = require('csvtojson');
import process = require('process');
import { execSync } from 'child_process';
const StreamZip = require('node-stream-zip');

interface CSVProperties {
  nodeNumber?: string;
  level?: string;
  fileName: string;
  x: string;
  y: string;
}
export abstract class SurveyService {
  static async unzipValidateFile(
    files: {
      [fieldname: string]: Express.Multer.File[];
    },
    site: ISite,
  ) {
    try {
      const { zipFile, properties } = files;

      if (
        zipFile[0].mimetype !== 'application/zip' &&
        properties[0].mimetype !== 'text/csv'
      )
        throw new Error('Invalid file types');

      const zip = new StreamZip({
        file: `${zipFile[0].path}`,
        storeEntries: true,
      });

      const extractedFolder = zipFile[0].filename.replace('.zip', '');

      zip.on('error', (err: any) => {
        console.error(err);
      });
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

          const appFilesExist = entries.some(
            (entry: any) =>
              entry.name.endsWith('app-files/') && entry.isDirectory,
          );

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

      for (const field of csvJSON) {
        if (!readData.includes(field.fileName))
          throw new Error('Image does not exist in the Marzipano zip file.');
      }

      const { MANTA_ROOT_FOLDER, MANTA_USER, MANTA_KEY_ID, MANTA_HOST_NAME } =
        process.env;

      const mputCmd = `mput -f ${site.tag}.tar.gz ${MANTA_ROOT_FOLDER}/${site.tag}.tar.gz --url=${MANTA_HOST_NAME}`;
      const extractCmd = `echo ${MANTA_ROOT_FOLDER}/${site.tag}.tar.gz | \
                  mjob create -o -m gzcat -m 'muntar -f $MANTA_INPUT_FILE ${MANTA_ROOT_FOLDER}/${site.tag}' --url=${MANTA_HOST_NAME}`;

      const upload = execSync(
        `cd tmp/${extractedFolder}/app-files/tiles && tar -czvf ${site.tag}.tar.gz . && ${mputCmd} && ${extractCmd}`,
      );
      if (!upload) return false;

      return true;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }

  static async uploadToDB(
    files: {
      [fieldname: string]: Express.Multer.File[];
    },
    site: ISite,
  ) {
    try {
      const { zipFile, properties } = files;

      if (
        zipFile[0].mimetype !== 'application/zip' &&
        properties[0].mimetype !== 'text/csv'
      )
        throw new Error('Invalid file types');

      // Upload Survey Nodes from DataJS
      // Upload to minimap nodes
      // Upload Minimap conversions with the provided x/y coords from the CSV
      //Link/Info Hotspots if included
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
}
